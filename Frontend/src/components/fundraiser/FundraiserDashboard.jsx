import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import axios from '../../config/axios';
import { Pencil, Trash2 } from "lucide-react";
import { toast } from 'react-hot-toast';

const FundraiserDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [approvedCauses, setApprovedCauses] = useState([]);
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
        
        // Filter for user's approved causes
        const userApprovedCauses = response.data.filter(cause => {
          const causeFundraiserId = cause.fundraiserId?._id || cause.fundraiserId;
          return causeFundraiserId === user._id && cause.status?.toLowerCase() === 'approved';
        });
        
        // Set approved causes
        setApprovedCauses(userApprovedCauses);

        // Calculate total amount raised
        const totalRaised = userApprovedCauses.reduce((sum, cause) => sum + (cause.currentAmount || 0), 0);
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
      <div>
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
              <CauseCard key={cause._id} cause={cause} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CauseCard = ({ cause, onEdit, onDelete }) => {
  if (!cause) return null;

  const progress = cause.targetAmount > 0 
    ? (cause.currentAmount / cause.targetAmount) * 100 
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
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-100 text-gray-800"
            onClick={() => onEdit(cause._id)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onDelete(cause._id)}
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
            <span>Goal: ₹{Number(cause.targetAmount || 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(cause.createdAt || Date.now()), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FundraiserDashboard; 