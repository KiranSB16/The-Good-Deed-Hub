import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import axios from '@/lib/axios';
import { Pencil, Trash2 } from "lucide-react";
import { toast } from 'react-hot-toast';

const FundraiserDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [approvedCauses, setApprovedCauses] = useState([]);
  const [completedCauses, setCompletedCauses] = useState([]);
  const [stats, setStats] = useState({
    totalRaised: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/causes');
        
        // Check if response.data is an array or an object with a causes property
        const causesArray = Array.isArray(response.data) ? response.data : response.data.causes;
        
        if (!Array.isArray(causesArray)) {
          console.error('Unexpected response format:', response.data);
          setError('Invalid data format received from server');
          return;
        }
        
        // Filter for user's causes
        const userCauses = causesArray.filter(cause => {
          const causeFundraiserId = cause.fundraiserId?._id || cause.fundraiserId;
          return causeFundraiserId === user._id;
        });
        
        // Filter active and completed causes
        const activeCauses = userCauses.filter(cause => 
          cause.status?.toLowerCase() === 'approved' && cause.status?.toLowerCase() !== 'completed'
        );
        
        const finishedCauses = userCauses.filter(cause => 
          cause.status?.toLowerCase() === 'completed'
        );
        
        // Set causes
        setApprovedCauses(activeCauses);
        setCompletedCauses(finishedCauses);

        // Calculate total amount raised from all causes (active and completed)
        const totalRaised = userCauses.reduce((sum, cause) => sum + (cause.currentAmount || 0), 0);
        setStats({ totalRaised });
      } catch (error) {
        console.error('Error fetching causes:', error);
        setError(error.response?.data?.message || 'Failed to load causes');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchCauses();
    }
  }, [user]);

  const handleEdit = (causeId) => {
    navigate(`/edit-cause/${causeId}`);
  };

  const handleDelete = async (causeId) => {
    try {
      await axios.delete(`/causes/${causeId}`);
      setApprovedCauses(approvedCauses.filter(cause => cause._id !== causeId));
      toast.success('Cause deleted successfully');
    } catch (error) {
      console.error('Error deleting cause:', error);
      toast.error(error.response?.data?.message || 'Failed to delete cause');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h1>
      
      {/* Statistics Card */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Amount Raised</CardTitle>
            <CardDescription className="text-2xl font-bold text-green-600">
              ₹{stats.totalRaised.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Approved Causes List */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Active Fundraising Campaigns</h2>
        {loading ? (
          <Card className="p-6">
            <p className="text-center">Loading causes...</p>
          </Card>
        ) : error ? (
          <Card className="p-6">
            <p className="text-center text-red-600">{error}</p>
          </Card>
        ) : approvedCauses.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No active causes found. Create a new cause to get started!</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {approvedCauses.map((cause) => (
              <CauseCard key={cause._id} cause={cause} />
            ))}
          </div>
        )}
      </div>
      
      {/* Completed Causes List */}
      {!loading && completedCauses.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Completed Campaigns</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedCauses.map((cause) => (
              <CauseCard key={cause._id} cause={cause} isCompleted={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CauseCard = ({ cause, isCompleted = false }) => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  if (!cause) return null;

  const causeFundraiserId = cause.fundraiserId?._id || cause.fundraiserId;
  const isOwner = user?._id === causeFundraiserId;

  const handleEdit = () => {
    navigate(`/fundraiser/causes/edit/${cause._id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this cause?')) {
      return;
    }
    try {
      await axios.delete(`causes/${cause._id}`);
      toast.success('Cause deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting cause:', error);
      toast.error(error.response?.data?.message || 'Failed to delete cause');
    }
  };

  const handleViewDetails = () => {
    navigate(`/causes/${cause._id}`);
  };

  const progress = cause.goalAmount > 0 
    ? (cause.currentAmount / cause.goalAmount) * 100 
    : 0;

  return (
    <Card className="overflow-hidden group">
      <div className="relative">
        <img 
          src={cause.images?.[0] || '/placeholder-image.jpg'} 
          alt={cause.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium 
            ${isCompleted 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'}`}>
            {isCompleted ? 'Completed' : 'Approved'}
          </span>
        </div>
        {!isCompleted && (
          <div className="absolute bottom-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100 text-gray-800"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="truncate">{cause.title}</CardTitle>
        <CardDescription className="line-clamp-2">{cause.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-sm font-medium">
            <span>Current: ₹{Number(cause.currentAmount || 0).toLocaleString()}</span>
            <span>Goal: ₹{Number(cause.goalAmount || 0).toLocaleString()}</span>
          </div>
        </div>
        
        {isCompleted && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-sm text-blue-800">
            <p className="font-semibold">🎉 Goal Reached!</p>
            <p>This cause has been fully funded. Thank you for your successful campaign!</p>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(cause.createdAt || Date.now()), { addSuffix: true })}
        </div>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default FundraiserDashboard; 