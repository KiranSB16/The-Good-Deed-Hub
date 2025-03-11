import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import axios from '@/lib/axios';
import { Pencil, Trash2, Clock } from "lucide-react";
import { toast } from 'react-hot-toast';
import { Badge } from "@/components/ui/badge";

const FundraiserDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [approvedCauses, setApprovedCauses] = useState([]);
  const [pendingCauses, setPendingCauses] = useState([]);
  const [rejectedCauses, setRejectedCauses] = useState([]);
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
        
        console.log('Raw causes data:', response.data);
        
        // Filter causes by status
        const userCauses = response.data.filter(cause => cause.fundraiserId?._id === user._id);
        console.log('User causes:', userCauses);

        // Log each cause's status
        userCauses.forEach(cause => {
          console.log(`Cause ${cause._id} status:`, cause.status);
        });

        const approved = userCauses.filter(cause => cause.status === 'approved');
        const pending = userCauses.filter(cause => cause.status === 'pending');
        const rejected = userCauses.filter(cause => cause.status === 'rejected');
        
        console.log('Filtered causes:', {
          approved: approved.length,
          pending: pending.length,
          rejected: rejected.length,
          pendingCauses: pending
        });
        
        // Set causes by status
        setApprovedCauses(approved);
        setPendingCauses(pending);
        setRejectedCauses(rejected);

        // Calculate total amount raised from approved causes
        const totalRaised = approved.reduce((sum, cause) => sum + (cause.currentAmount || 0), 0);
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
    navigate(`/fundraiser/causes/edit/${causeId}`);
  };

  const handleDelete = async (causeId) => {
    try {
      await axios.delete(`/causes/${causeId}`);
      // Remove the deleted cause from all lists
      setApprovedCauses(prev => prev.filter(cause => cause._id !== causeId));
      setPendingCauses(prev => prev.filter(cause => cause._id !== causeId));
      setRejectedCauses(prev => prev.filter(cause => cause._id !== causeId));
      toast.success('Cause deleted successfully');
    } catch (error) {
      console.error('Error deleting cause:', error);
      toast.error(error.response?.data?.message || 'Failed to delete cause');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

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

      {/* Pending Causes */}
      {pendingCauses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pending Approval</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingCauses.map((cause) => (
              <CauseCard 
                key={cause._id} 
                cause={cause} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                status="pending"
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Causes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Active Fundraising Campaigns</h2>
        {approvedCauses.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No active causes found. Create a new cause to get started!</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {approvedCauses.map((cause) => (
              <CauseCard 
                key={cause._id} 
                cause={cause} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                status="approved"
              />
            ))}
          </div>
        )}
      </div>

      {/* Rejected Causes */}
      {rejectedCauses.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Rejected Causes</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rejectedCauses.map((cause) => (
              <CauseCard 
                key={cause._id} 
                cause={cause} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                status="rejected"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CauseCard = ({ cause, onEdit, onDelete, status }) => {
  if (!cause) return null;

  const progress = cause.goalAmount > 0 
    ? (cause.currentAmount / cause.goalAmount) * 100 
    : 0;

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending Approval</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={cause.images?.[0] || '/placeholder-image.jpg'} 
          alt={cause.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-100"
            onClick={() => onEdit(cause._id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onDelete(cause._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{cause.title}</CardTitle>
          {getStatusBadge()}
        </div>
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
        <div className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(cause.createdAt || Date.now()), { addSuffix: true })}
        </div>
        {cause.rejectionReason && (
          <div className="mt-2 text-sm text-red-600">
            Rejection reason: {cause.rejectionReason}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FundraiserDashboard; 