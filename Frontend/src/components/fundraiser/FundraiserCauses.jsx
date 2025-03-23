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

        // Check if response.data is an array or an object with a causes property
        const causesArray = Array.isArray(response.data) ? response.data : response.data.causes;
        
        if (!Array.isArray(causesArray)) {
          console.error('Unexpected response format:', response.data);
          throw new Error('Invalid data format received from server');
        }

        const userCauses = causesArray.filter(cause => 
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

  // Filter causes by status
  const approvedCauses = causes.filter(cause => cause.status?.toLowerCase() === 'approved');
  const pendingCauses = causes.filter(cause => cause.status?.toLowerCase() === 'pending approval' || cause.status?.toLowerCase() === 'pending');
  const rejectedCauses = causes.filter(cause => cause.status?.toLowerCase() === 'rejected');
  const completedCauses = causes.filter(cause => cause.status?.toLowerCase() === 'completed');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Causes</h1>
        <Button onClick={() => window.location.href = '/create-cause'}>
          Create New Cause
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({causes.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCauses.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCauses.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCauses.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCauses.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <CausesGrid causes={causes} />
        </TabsContent>
        
        <TabsContent value="approved">
          <CausesGrid causes={approvedCauses} />
        </TabsContent>
        
        <TabsContent value="pending">
          <CausesGrid causes={pendingCauses} />
        </TabsContent>
        
        <TabsContent value="completed">
          <CausesGrid causes={completedCauses} />
        </TabsContent>
        
        <TabsContent value="rejected">
          <CausesGrid causes={rejectedCauses} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CausesGrid = ({ causes }) => {
  if (causes.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No causes found in this category.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {causes.map(cause => (
        <CauseCard key={cause._id} cause={cause} />
      ))}
    </div>
  );
};

const CauseCard = ({ cause }) => {
  const navigate = useNavigate();
  
  if (!cause) return null;

  // Handle status specific styling
  const getStatusStyles = (status) => {
    status = status?.toLowerCase();
    switch (status) {
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'pending approval':
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const statusStyles = getStatusStyles(cause.status);
  
  const handleEdit = () => {
    navigate(`/fundraiser/causes/edit/${cause._id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this cause?')) {
      return;
    }
    
    try {
      await axios.delete(`/causes/${cause._id}`);
      toast.success('Cause deleted successfully');
      // Reload the page to refresh the list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting cause:', error);
      toast.error(error.response?.data?.message || 'Failed to delete cause');
    }
  };
  
  const handleViewDetails = () => {
    navigate(`/causes/${cause._id}`);
  };

  // Calculate progress percentage
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
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
            {cause.status}
          </span>
        </div>
        
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
        
        {cause.status?.toLowerCase() === 'completed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-sm text-blue-800">
            <p className="font-semibold">🎉 Goal Reached!</p>
            <p>Thank you for your dedication to this cause. The funds raised are making a real difference!</p>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground mb-2">
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

export default FundraiserCauses; 