import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCauses } from '../features/causeSlice';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CauseList = () => {
  const dispatch = useDispatch();
  const { causes, loading, error } = useSelector((state) => state.causes);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchCauses());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-8">Loading causes...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  // Filter causes based on user role and status
  const getFilteredCauses = () => {
    if (!causes) return [];
    
    if (user?.role === 'fundraiser') {
      // For fundraiser, show their own causes (both pending and approved)
      return causes.filter(cause => 
        cause.fundraiserId?._id === user._id && 
        (cause.status === 'approved' || cause.status === 'pending approval')
      );
    } else {
      // For donors and others, show only approved causes
      return causes.filter(cause => cause.status === 'approved');
    }
  };

  const filteredCauses = getFilteredCauses();
  const approvedCauses = filteredCauses.filter(cause => cause.status === 'approved');
  const pendingCauses = filteredCauses.filter(cause => cause.status === 'pending approval');

  const CauseCard = ({ cause }) => (
    <Card className="overflow-hidden">
      {cause.images?.[0] && (
        <img
          src={cause.images[0]}
          alt={cause.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold">{cause.title}</h3>
          {user?.role === 'fundraiser' && (
            <span className={`px-2 py-1 text-xs rounded-full capitalize ${
              cause.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {cause.status}
            </span>
          )}
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {cause.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>₹{cause.raisedAmount || 0}</span>
            <span>₹{cause.goalAmount}</span>
          </div>
          <Progress value={calculateProgress(cause.raisedAmount || 0, cause.goalAmount)} />
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>By {cause.fundraiserId?.name}</span>
          <span>{formatDistanceToNow(new Date(cause.endDate), { addSuffix: true })}</span>
        </div>

        <Button
          onClick={() => window.location.href = `/causes/${cause._id}`}
          className="w-full mt-4"
          variant="outline"
        >
          View Details
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">
          {user?.role === 'fundraiser' ? 'My Causes' : 'Active Causes'}
        </h2>
        {user?.role === 'fundraiser' && (
          <Button
            onClick={() => window.location.href = '/create-cause'}
            className="bg-primary text-primary-foreground"
          >
            Create New Cause
          </Button>
        )}
      </div>

      {user?.role === 'fundraiser' ? (
        // Show tabs for fundraiser view
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({filteredCauses.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedCauses.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCauses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCauses.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedCauses.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCauses.map((cause) => (
                <CauseCard key={cause._id} cause={cause} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Show simple grid for donors
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCauses.map((cause) => (
            <CauseCard key={cause._id} cause={cause} />
          ))}
        </div>
      )}

      {(!filteredCauses || filteredCauses.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No causes found. {user?.role === 'fundraiser' ? 'Create one now!' : ''}
        </div>
      )}
    </div>
  );
};

export default CauseList;