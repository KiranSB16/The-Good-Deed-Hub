import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
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

export default function SavedCauses() {
  const navigate = useNavigate();
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedCauses();
  }, []);

  const fetchSavedCauses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/donor/saved-causes');
      setCauses(response.data.savedCauses);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error('Failed to fetch saved causes');
    }
  };

  const handleUnsave = async (causeId) => {
    try {
      await axios.delete(`/donor/saved-causes/${causeId}`);
      setCauses(causes.filter(cause => cause._id !== causeId));
      toast.success('Cause removed from saved list');
    } catch (error) {
      toast.error('Failed to remove cause from saved list');
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
      navigator.clipboard.writeText(window.location.origin + '/cause/' + cause._id);
      toast.success('Link copied to clipboard');
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
        <Button onClick={fetchSavedCauses} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Saved Causes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {causes.map((cause) => (
          <Card key={cause._id} className="overflow-hidden">
            <div className="relative">
              <img
                src={cause.images?.[0] || '/placeholder.jpg'}
                alt={cause.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => handleShare(cause)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => handleUnsave(cause._id)}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
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
                <Progress value={((cause.currentAmount || 0) / (cause.goalAmount || 1)) * 100} />
                <div className="flex justify-between text-sm">
                  <span>
                    <IndianRupee className="inline h-4 w-4" />
                    {(cause.currentAmount || 0).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    of {(cause.goalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <Button className="w-full" onClick={() => navigate(`/causes/${cause._id}`)}>
                  Donate Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {causes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No saved causes</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/causes')}
          >
            Explore Causes
          </Button>
        </div>
      )}
    </div>
  );
} 