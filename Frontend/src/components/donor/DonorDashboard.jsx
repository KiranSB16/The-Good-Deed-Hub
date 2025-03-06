import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, BookmarkCheck, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import axios from '@/config/axios';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { fetchDonorStats } from '@/slices/donorSlice';
import { fetchCauses } from '@/slices/causeSlice';

const DonorDashboard = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    savedCauses: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useSelector((state) => state.user);
  const { causes, loading: causesLoading } = useSelector((state) => state.causes);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch donor-specific data if user is logged in
        if (user) {
          const [donorStats, savedResponse] = await Promise.all([
            dispatch(fetchDonorStats()).unwrap(),
            axios.get('/donor/saved-causes')
          ]);

          setStats({
            totalDonations: donorStats.totalAmount || 0,
            savedCauses: savedResponse.data.savedCauses?.length || 0
          });
        }

        // Always fetch causes as they are public
        await dispatch(fetchCauses()).unwrap();
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error?.response?.status === 401) {
          // If unauthorized, just fetch public causes
          await dispatch(fetchCauses()).unwrap();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, user]);

  const handleDonateClick = (causeId) => {
    if (!user) {
      navigate('/login', { state: { from: `/causes/${causeId}` } });
      return;
    }
    navigate(`/causes/${causeId}`);
  };

  const filteredCauses = causes?.filter(cause => 
    cause.status === 'approved' && 
    (searchTerm === '' || 
    cause.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cause.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (loading || causesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.name || 'Guest'}!</h1>
      
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">₹{stats.totalDonations}</h3>
                <p className="text-gray-500">Total Donations</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">{stats.savedCauses}</h3>
                <p className="text-gray-500">Saved Causes</p>
              </div>
              <BookmarkCheck className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search causes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Causes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCauses.map((cause) => (
          <Card key={cause._id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={cause.images?.[0] || '/placeholder.jpg'}
                alt={cause.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 right-2">
                {cause.category?.name}
              </Badge>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{cause.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {cause.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round((cause.currentAmount / cause.targetAmount) * 100)}%</span>
                </div>
                <Progress value={(cause.currentAmount / cause.targetAmount) * 100} />
                <div className="flex justify-between text-sm">
                  <span>Raised: ₹{cause.currentAmount}</span>
                  <span>Goal: ₹{cause.targetAmount}</span>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => handleDonateClick(cause._id)}
                >
                  Donate Now
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCauses.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No causes found</p>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard; 