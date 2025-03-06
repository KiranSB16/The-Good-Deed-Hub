import { useEffect, useState, startTransition } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDonorDonations, fetchDonorProfile } from '../slices/donorSlice';
import { fetchCauses } from '../slices/causeSlice';
import { useNavigate } from 'react-router-dom';
import DonorProfile from '../components/DonorProfile';
import { Loader2, Search, Calendar, Target, Clock, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Pagination } from '../components/ui/pagination';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 6;

const DonorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { donations, stats, loading, error } = useSelector((state) => state.donor);
  const { causes, loading: causesLoading, error: causesError } = useSelector((state) => state.causes);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCauses, setFilteredCauses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchDonorDonations()).unwrap();
        await dispatch(fetchCauses()).unwrap();
        await dispatch(fetchDonorProfile()).unwrap();
      } catch (error) {
        toast.error(error?.message || 'Failed to fetch data');
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (!causes) return;
    
    startTransition(() => {
      let result = [...(causes || [])].filter(cause => cause.status === 'approved');
      
      if (searchTerm) {
        result = result.filter(cause => 
          cause.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cause.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      switch (sortBy) {
        case 'latest':
          result.sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
          break;
        case 'target-high':
          result.sort((a, b) => (b?.targetAmount || 0) - (a?.targetAmount || 0));
          break;
        case 'progress-high':
          result.sort((a, b) => 
            ((b?.raisedAmount || 0) / (b?.targetAmount || 1)) - 
            ((a?.raisedAmount || 0) / (a?.targetAmount || 1))
          );
          break;
        default:
          break;
      }

      setFilteredCauses(result);
      setCurrentPage(1);
    });
  }, [causes, searchTerm, sortBy]);

  if (loading || causesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const paginatedCauses = filteredCauses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-600">Total Donations</h2>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-primary">
                  ${stats?.totalAmount?.toLocaleString() || '0'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  across {stats?.totalDonations || 0} donations
                </span>
              </div>
            </div>
            <Target className="h-8 w-8 text-primary opacity-75" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-600">Donation Status</h2>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Completed</span>
                  <Badge variant="success">{stats?.completedDonations || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Pending</span>
                  <Badge variant="warning">{stats?.pendingDonations || 0}</Badge>
                </div>
              </div>
            </div>
            <Clock className="h-8 w-8 text-secondary opacity-75" />
          </div>
        </Card>

        <DonorProfile />
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search causes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="target-high">Highest Target</SelectItem>
              <SelectItem value="progress-high">Highest Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recent Donations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Donations</h2>
          {donations?.length > 6 && (
            <Button variant="ghost" onClick={() => navigate('/donor/donations')} className="group">
              View All
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
        {!donations?.length ? (
          <Card className="p-6">
            <p className="text-center text-gray-500">No donations yet. Start making a difference today!</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => navigate('/causes')}>
                Browse Causes
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donations?.slice(0, 6).map((donation) => (
              <Card key={donation._id} className="p-4 hover:shadow-lg transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold line-clamp-1">{donation.causeId?.title || 'Untitled Cause'}</h3>
                    <Badge variant={donation.status === 'completed' ? 'success' : 'warning'}>
                      ${donation.amount?.toLocaleString() || '0'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </div>
                  {donation.message && (
                    <p className="text-sm text-gray-600 line-clamp-2">{donation.message}</p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full group"
                    onClick={() => navigate(`/causes/${donation.causeId?._id}`)}
                  >
                    View Cause
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Causes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Available Causes</h2>
          <Button variant="ghost" onClick={() => navigate('/causes')} className="group">
            View All
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        {causesError ? (
          <Card className="p-6">
            <p className="text-center text-red-500">{causesError}</p>
          </Card>
        ) : !filteredCauses.length ? (
          <Card className="p-6">
            <p className="text-center text-gray-500">No available causes found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCauses.map((cause) => (
              <Card key={cause._id} className="p-4 hover:shadow-lg transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold line-clamp-1">{cause.title}</h3>
                    <Badge variant="outline">{cause.category?.name || 'Uncategorized'}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{cause.description}</p>
                  <div className="space-y-2">
                    <Progress 
                      value={((cause.raisedAmount || 0) / (cause.targetAmount || 1)) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">${(cause.raisedAmount || 0).toLocaleString()}</span>
                      <span className="text-gray-500">of ${(cause.targetAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full group"
                    onClick={() => navigate(`/causes/${cause._id}`)}
                  >
                    Donate Now
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        {filteredCauses.length > ITEMS_PER_PAGE && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCauses.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;