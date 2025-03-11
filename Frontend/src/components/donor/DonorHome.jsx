import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../config/axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Heart, Share2, IndianRupee } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DonorHome() {
  const { user } = useSelector((state) => state.auth);
  const [causes, setCauses] = useState([]);
  const [savedCauses, setSavedCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedCauses();
    fetchCauses();
  }, []);

  const fetchCauses = async () => {
    try {
      const response = await axios.get('/causes');
      setCauses(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error('Failed to fetch causes');
    }
  };

  const fetchSavedCauses = async () => {
    try {
      const response = await axios.get('/donor/saved-causes');
      setSavedCauses(response.data.savedCauses);
    } catch (error) {
      console.error('Error fetching saved causes:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Card key={n} className="overflow-hidden">
            <Skeleton className="h-48" />
            <CardContent className="p-6">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-500">{error}</p>
        <Button onClick={fetchCauses} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {causes.map((cause) => (
          <Card key={cause._id} className="overflow-hidden">
            <div className="relative">
              <img
                src={cause.images?.[0] || '/placeholder.jpg'}
                alt={cause.title}
                className="w-full h-48 object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                onClick={() => handleSave(cause._id)}
              >
                <Heart
                  className="h-5 w-5"
                  fill={savedCauses.includes(cause._id) ? 'currentColor' : 'none'}
                />
              </Button>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="font-semibold text-lg">{cause.title}</h3>
                <Badge>{cause.category?.name}</Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {cause.description}
              </p>
              <div className="space-y-4">
                <Progress value={(cause.raisedAmount / cause.targetAmount) * 100} />
                <div className="flex justify-between text-sm">
                  <span>
                    <IndianRupee className="inline h-4 w-4" />
                    {cause.raisedAmount.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    of {cause.targetAmount.toLocaleString()}
                  </span>
                </div>
                <Button className="w-full" onClick={() => handleDonate(cause._id)}>
                  Donate Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {causes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No causes available</p>
        </div>
      )}
    </div>
  );
} 