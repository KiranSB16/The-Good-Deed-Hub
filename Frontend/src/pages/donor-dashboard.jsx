import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDonorDonations, fetchDonorProfile } from '../slices/donorSlice';
import { fetchCauses } from '../slices/causeSlice';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight, Heart, Share2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';

const DonorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { donations, stats, loading: donorLoading, error: donorError } = useSelector((state) => state.donor);
  const { causes, loading: causesLoading, error: causesError } = useSelector((state) => state.causes);
  
  const [savedCauses, setSavedCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(fetchDonorDonations()).unwrap(),
          dispatch(fetchCauses()).unwrap(),
          dispatch(fetchDonorProfile()).unwrap(),
          fetchSavedCauses()
        ]);
      } catch (error) {
        toast.error(error?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const fetchSavedCauses = async () => {
    try {
      const response = await axios.get('/donor/saved-causes');
      setSavedCauses(response.data.savedCauses.map(cause => cause._id));
    } catch (error) {
      console.error('Error fetching saved causes:', error);
      toast.error('Failed to fetch saved causes');
    }
  };

  const handleSaveCause = async (causeId) => {
    try {
      if (savedCauses.includes(causeId)) {
        await axios.delete(`/donor/saved-causes/${causeId}`);
        setSavedCauses(savedCauses.filter(id => id !== causeId));
        toast.success('Cause removed from saved list');
      } else {
        await axios.post('/donor/saved-causes', { causeId });
        setSavedCauses([...savedCauses, causeId]);
        toast.success('Cause saved successfully');
      }
    } catch (error) {
      console.error('Error saving cause:', error);
      toast.error(error.response?.data?.message || 'Failed to save cause');
    }
  };

  const handleShare = async (cause) => {
    try {
      await navigator.share({
        title: cause.title,
        text: cause.description,
        url: window.location.origin + '/cause/' + cause._id
      });
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(window.location.origin + '/cause/' + cause._id);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading || causesLoading || donorLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const CauseCard = ({ cause }) => {
    const progress = cause.targetAmount > 0 
      ? (cause.currentAmount / cause.targetAmount) * 100 
      : 0;
    const isSaved = savedCauses.includes(cause._id);

    return (
      <Card className="overflow-hidden flex flex-col">
        <div className="relative">
          <img 
            src={cause.images?.[0] || '/placeholder-image.jpg'} 
            alt={cause.title} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={() => handleShare(cause)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant={isSaved ? "default" : "secondary"}
              size="icon"
              className={`h-8 w-8 ${isSaved ? 'bg-primary text-primary-foreground' : 'bg-white/90 hover:bg-white'}`}
              onClick={() => handleSaveCause(cause._id)}
            >
              <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-semibold line-clamp-1">{cause.title}</h3>
            <Badge variant="outline">{cause.category?.name || 'Uncategorized'}</Badge>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{cause.description}</p>
          <div className="space-y-2">
            <Progress 
              value={progress} 
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
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Donor Dashboard</h1>
      </div>

      {/* Causes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading || causesLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="h-[400px] animate-pulse" />
          ))
        ) : causesError ? (
          <div className="col-span-full text-center text-red-500">{causesError}</div>
        ) : Array.isArray(causes) && causes.length > 0 ? (
          causes.map(cause => <CauseCard key={cause._id} cause={cause} />)
        ) : (
          <div className="col-span-full text-center text-gray-500">No causes found</div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;