import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart } from 'lucide-react';
import { fetchCauses } from '@/slices/causeSlice';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

const DonorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [savedCauses, setSavedCauses] = useState([]);
  const { user } = useSelector((state) => state.user);
  const { causes, loading: causesLoading } = useSelector((state) => state.causes);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCauses()).unwrap(),
          user ? fetchSavedCauses() : Promise.resolve([])
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, user]);

  const fetchSavedCauses = async () => {
    try {
      const response = await axios.get('/donor/saved-causes');
      if (response.data.savedCauses) {
        setSavedCauses(response.data.savedCauses.map(cause => cause._id));
      } else {
        console.warn('No saved causes data received:', response.data);
        setSavedCauses([]);
      }
    } catch (error) {
      console.error('Error fetching saved causes:', error);
      setSavedCauses([]);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      toast.error('Failed to fetch saved causes');
    }
  };

  const handleSaveCause = async (causeId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (savedCauses.includes(causeId)) {
        await axios.delete(`/donor/saved-causes/${causeId}`);
        setSavedCauses(savedCauses.filter(id => id !== causeId));
        toast.success('Cause removed from saved list');
      } else {
        const response = await axios.post('/donor/save-cause', { causeId });
        console.log('Save cause response:', response.data);
        setSavedCauses([...savedCauses, causeId]);
        toast.success('Cause saved successfully');
      }
    } catch (error) {
      console.error('Error saving cause:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      toast.error(error.response?.data?.message || 'Failed to save cause');
    }
  };

  const handleDonateClick = (causeId) => {
    if (!user) {
      navigate('/login', { state: { from: `/causes/${causeId}` } });
      return;
    }
    navigate(`/causes/${causeId}`);
  };

  const approvedCauses = causes?.filter(cause => cause.status === 'approved') || [];

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

      {/* Causes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedCauses.map((cause) => (
          <Card key={cause._id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={cause.images?.[0] || '/placeholder.jpg'}
                alt={cause.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant={savedCauses.includes(cause._id) ? "default" : "secondary"}
                  size="icon"
                  className={`h-8 w-8 shadow-md ${
                    savedCauses.includes(cause._id) 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-white hover:bg-gray-100 text-red-500'
                  }`}
                  onClick={() => handleSaveCause(cause._id)}
                >
                  <Heart 
                    className="h-5 w-5" 
                    fill={savedCauses.includes(cause._id) ? "currentColor" : "none"} 
                  />
                </Button>
              </div>
              <Badge className="absolute top-2 left-2">
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
                  <span>{Math.round(((cause.currentAmount || 0) / (cause.goalAmount || 1)) * 100)}%</span>
                </div>
                <Progress value={((cause.currentAmount || 0) / (cause.goalAmount || 1)) * 100} />
                <div className="flex justify-between text-sm">
                  <span>Raised: ₹{cause.currentAmount || 0}</span>
                  <span>Goal: ₹{cause.goalAmount || 0}</span>
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

      {approvedCauses.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No causes found</p>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard; 