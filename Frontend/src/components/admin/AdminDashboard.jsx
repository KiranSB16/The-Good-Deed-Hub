import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeCauses, setActiveCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [activeTab, setActiveTab] = useState('active');
  const [activeCausesCount, setActiveCausesCount] = useState(0);
  const [completedCausesCount, setCompletedCausesCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchDashboardData();
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make a single call and handle filtering on the client side
      const causesResponse = await axios.get('/causes', {
        params: {
          includeCompleted: true,
          limit: 50 // Increase limit to ensure we get more causes
        }
      })
        .catch(error => {
          console.error('Error fetching causes:', error);
          throw error;
        });
      
      if (!causesResponse || !causesResponse.data) {
        throw new Error('No data received from the server');
      }
      
      console.log('API Response:', causesResponse.data);
      
      // Extract causes array from response
      const allCauses = causesResponse.data.causes || [];
      
      if (!Array.isArray(allCauses)) {
        console.error('Expected causes to be an array, got:', typeof allCauses);
        throw new Error('Invalid data format received from the server');
      }
      
      // Set all causes to state
      setActiveCauses(allCauses);
      
      // Log the counts for debugging
      const pendingCount = allCauses.filter(cause => cause.status === 'pending').length;
      const approvedCount = allCauses.filter(cause => cause.status === 'approved').length;
      const completedCount = allCauses.filter(cause => cause.status === 'completed').length;
      
      console.log('Fetched causes:', {
        pending: pendingCount,
        approved: approvedCount,
        completed: completedCount,
        total: allCauses.length
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard data';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get counts for active and completed causes
  const fetchCauseCounts = async () => {
    try {
      // Fetch active causes count
      const activeResult = await axios.get('/causes/count', {
        params: {
          status: 'approved',
          search,
          category: category === 'all' ? undefined : category
        }
      });
      
      // Fetch completed causes count
      const completedResult = await axios.get('/causes/count', {
        params: {
          status: 'completed',
          search,
          category: category === 'all' ? undefined : category
        }
      });
      
      return {
        activeCount: activeResult.data.count || 0,
        completedCount: completedResult.data.count || 0
      };
    } catch (error) {
      console.error('Error fetching cause counts:', error);
      return { activeCount: 0, completedCount: 0 };
    }
  };

  // Fetch counts when filters change
  useEffect(() => {
    const getCounts = async () => {
      const counts = await fetchCauseCounts();
      setActiveCausesCount(counts.activeCount);
      setCompletedCausesCount(counts.completedCount);
    };
    
    getCounts();
  }, [search, category]);

  // Filter causes based on status
  const getFilteredAndSortedCauses = () => {
    let filteredCauses = [...activeCauses];

    // First filter by status based on active tab
    filteredCauses = filteredCauses.filter(cause => 
      activeTab === 'active' ? cause.status === 'approved' : cause.status === 'completed'
    );

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCauses = filteredCauses.filter(cause =>
        cause.title.toLowerCase().includes(searchLower) ||
        cause.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category !== 'all') {
      filteredCauses = filteredCauses.filter(cause =>
        cause.category?.name === category
      );
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        filteredCauses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filteredCauses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        filteredCauses.sort((a, b) => b.goalAmount - a.goalAmount);
        break;
      case 'lowest':
        filteredCauses.sort((a, b) => a.goalAmount - b.goalAmount);
        break;
      default:
        break;
    }

    return filteredCauses;
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handleSortChange = (value) => {
    setSort(value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const StatCard = ({ title, value, subtitle, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md ${className}`}>
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
        {typeof value === 'number' && !value.toString().includes('₹') 
          ? value.toLocaleString() 
          : value}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );

  const CauseCard = ({ cause }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <img
          src={cause.images?.[0] || '/placeholder-cause.jpg'}
          alt={cause.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg line-clamp-1">{cause.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
          {cause.description}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Category</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {cause.category?.name || 'General'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Goal Amount</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ₹{cause.goalAmount?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <span className={`font-medium ${cause.status === 'completed' ? 'text-blue-600 dark:text-blue-400' : cause.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
              {cause.status === 'completed' ? 'Completed' : cause.status === 'pending' ? 'Pending' : 'Active'}
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {cause.status === 'completed' ? 'Ended' : 'Ends'}: {new Date(cause.endDate).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            {cause.documents?.length > 0 && (
              <Button
                onClick={() => window.open(cause.documents[0], '_blank')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                View PDF
              </Button>
            )}
            <Button
              onClick={() => navigate(`/causes/${cause._id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <Button onClick={fetchDashboardData} className="bg-blue-600 hover:bg-blue-700 text-white">
          Retry
        </Button>
      </div>
    );
  }

  const filteredCauses = getFilteredAndSortedCauses();
  const totalPages = Math.ceil(filteredCauses.length / itemsPerPage);
  const paginatedCauses = filteredCauses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>

        {/* Tabs for Active/Completed Causes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('active')}
              >
                Active Causes ({activeCausesCount})
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('completed')}
              >
                Completed Causes ({completedCausesCount})
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search causes..."
                    value={search}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Goal</SelectItem>
                    <SelectItem value="lowest">Lowest Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Causes Grid */}
          {paginatedCauses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCauses.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === 'active' 
                  ? 'No active causes found matching your criteria.' 
                  : 'No completed causes found matching your criteria.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}