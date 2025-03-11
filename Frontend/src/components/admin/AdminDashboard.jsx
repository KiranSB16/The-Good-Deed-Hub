import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingCauses: 0,
    activeCauses: 0,
    completedCauses: 0,
    totalGoalAmount: 0
  });
  const [activeCauses, setActiveCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch causes with different statuses
      const [pendingCauses, approvedCauses, completedCauses] = await Promise.all([
        axios.get('/causes?status=pending'),
        axios.get('/causes?status=approved'),
        axios.get('/causes?status=completed')
      ]);

      // Calculate total goal amount from approved causes
      const totalGoalAmount = approvedCauses.data.reduce(
        (sum, cause) => sum + (cause.goalAmount || 0),
        0
      );
      
      setStats({
        pendingCauses: pendingCauses.data.length || 0,
        activeCauses: approvedCauses.data.length || 0,
        completedCauses: completedCauses.data.length || 0,
        totalGoalAmount
      });

      // Set active causes
      setActiveCauses(approvedCauses.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard data';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            <span className="font-medium text-green-600 dark:text-green-400">
              Active
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Ends: {new Date(cause.endDate).toLocaleDateString()}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <Button
            onClick={() => navigate('/admin/causes')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Review Pending Causes
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Causes"
            value={stats.pendingCauses}
            className="border-l-4 border-yellow-500"
          />
          <StatCard
            title="Active Causes"
            value={stats.activeCauses}
            className="border-l-4 border-green-500"
          />
          <StatCard
            title="Completed Causes"
            value={stats.completedCauses}
            className="border-l-4 border-blue-500"
          />
          <StatCard
            title="Total Goal Amount"
            value={`₹${stats.totalGoalAmount.toLocaleString()}`}
            className="border-l-4 border-purple-500"
          />
        </div>

        {/* Active Causes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Active Causes
            </h2>
            <Button
              onClick={() => navigate('/admin/causes?status=approved')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              variant="ghost"
            >
              View All
            </Button>
          </div>
          
          {activeCauses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCauses.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No active causes at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 