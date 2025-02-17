import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from 'date-fns';
import axios from '../config/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FundraiserCauses = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useSelector((state) => state.user);
  
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        console.log("Current user:", user); // Debug log
        if (!user || !user._id) { // Changed from user.id to user._id
          throw new Error('User ID not available');
        }

        setLoading(true);
        const response = await axios.get('/api/causes');
        console.log("API Response:", response.data);

        const userCauses = response.data.filter(cause => {
          console.log("Comparing IDs:", {
            causeFundraiserId: cause.fundraiserId._id,
            userId: user._id
          });
          return cause.fundraiserId._id === user._id; // Changed from user.id to user._id
        });

        console.log("Filtered causes:", userCauses);
        setCauses(userCauses);
      } catch (error) {
        console.error('Error fetching causes:', error);
        setError(error.message || 'Failed to load causes');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) { // Changed from user?.id to user?._id
      fetchCauses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const CauseCard = ({ cause }) => (
    <Card className="overflow-hidden">
      {cause.images && cause.images[0] && (
        <div className="relative h-48">
          <img
            src={cause.images[0]}
            alt={cause.title}
            className="w-full h-full object-cover"
          />
          {cause.images.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              +{cause.images.length - 1} more
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold">{cause.title}</h2>
          <span
            className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(
              cause.status
            )}`}
          >
            {cause.status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {cause.description.slice(0, 100)}...
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {Math.round((cause.currentAmount / cause.goalAmount) * 100)}%
            </span>
          </div>
          <Progress
            value={(cause.currentAmount / cause.goalAmount) * 100}
            className="h-2"
          />
          <div className="flex justify-between text-sm">
            <span>₹{cause.currentAmount.toLocaleString()}</span>
            <span>₹{cause.goalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Created {formatDistanceToNow(new Date(cause.createdAt))} ago</p>
          {cause.status === 'rejected' && (
            <p className="mt-2 text-red-600">
              Reason: {cause.rejectionMessage || 'No reason provided'}
            </p>
          )}
          {cause.documents && cause.documents.length > 0 && (
            <p className="mt-2">
              <a
                href={cause.documents[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Supporting Document
              </a>
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Causes</h1>
        <Card className="p-6">
          <p className="text-center">Loading your causes...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Causes</h1>
        <Card className="p-6">
          <p className="text-center text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  const approvedCauses = causes.filter(cause => cause.status === 'approved');
  const pendingCauses = causes.filter(cause => cause.status === 'pending approval');
  const rejectedCauses = causes.filter(cause => cause.status === 'rejected');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Causes</h1>

      {causes.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            You haven't created any causes yet.
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({causes.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedCauses.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCauses.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCauses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {causes.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedCauses.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingCauses.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rejectedCauses.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default FundraiserCauses;
