import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from 'date-fns';
import axios from '@/lib/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const FundraiserCauses = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useSelector((state) => state.user);
  
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        if (!user?._id) {
          throw new Error('User ID not available');
        }

        setLoading(true);
        setError(null);
        const response = await axios.get('/causes');
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        const userCauses = response.data.filter(cause => 
          cause.fundraiserId?._id === user._id || cause.fundraiserId === user._id
        );

        setCauses(userCauses);
      } catch (error) {
        console.error('Error fetching causes:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load causes');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchCauses();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  const pendingCauses = causes.filter(cause => cause.status === 'pending');
  const approvedCauses = causes.filter(cause => cause.status === 'approved');
  const rejectedCauses = causes.filter(cause => cause.status === 'rejected');

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({causes.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCauses.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCauses.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCauses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {causes.map(cause => (
              <CauseCard key={cause._id} cause={cause} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingCauses.map(cause => (
              <CauseCard key={cause._id} cause={cause} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedCauses.map(cause => (
              <CauseCard key={cause._id} cause={cause} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedCauses.map(cause => (
              <CauseCard key={cause._id} cause={cause} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CauseCard = ({ cause }) => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  if (!cause) return null;

  const causeFundraiserId = cause.fundraiserId?._id || cause.fundraiserId;
  const isOwner = user?._id === causeFundraiserId;

  console.log('Cause data:', {
    currentAmount: cause.currentAmount,
    goalAmount: cause.goalAmount,
    targetAmount: cause.targetAmount
  });

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

  const handleResubmit = async () => {
    try {
      // Update the cause status back to pending
      await axios.put(`/causes/${cause._id}`, {
        status: 'pending',
        rejectionReason: null // Clear the rejection reason
      });
      toast.success('Cause resubmitted for approval');
      window.location.reload();
    } catch (error) {
      console.error('Error resubmitting cause:', error);
      toast.error(error.response?.data?.message || 'Failed to resubmit cause');
    }
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
        {isOwner && cause.status !== 'approved' && (
          <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
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
        {isOwner && cause.status === 'approved' && (
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Live - Cannot be edited or deleted
            </span>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{cause.title}</CardTitle>
          <div className="text-sm font-medium">
            {cause.status === 'pending' && (
              <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Pending</span>
            )}
            {cause.status === 'approved' && (
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Approved</span>
            )}
            {cause.status === 'rejected' && (
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded">Rejected</span>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2">{cause.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cause.status === 'rejected' && cause.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <h4 className="text-sm font-semibold text-red-700 mb-1">Rejection Reason:</h4>
            <p className="text-sm text-red-600">{cause.rejectionReason}</p>
            <Button
              onClick={handleResubmit}
              className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              Resubmit for Approval
            </Button>
          </div>
        )}
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
        <div className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(cause.createdAt || Date.now()), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FundraiserCauses;
