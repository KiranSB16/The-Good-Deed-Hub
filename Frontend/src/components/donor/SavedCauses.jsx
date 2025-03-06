import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Share2, Search, Filter, IndianRupee } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedCauses() {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filteredCauses, setFilteredCauses] = useState([]);

  useEffect(() => {
    fetchSavedCauses();
  }, []);

  useEffect(() => {
    filterAndSortCauses();
  }, [causes, searchTerm, category, sortBy]);

  const fetchSavedCauses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/donor/saved-causes');
      setCauses(response.data.savedCauses);
    } catch (error) {
      console.error('Error fetching saved causes:', error);
      setError(error.response?.data?.message || 'Failed to load saved causes');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCauses = () => {
    let filtered = [...causes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cause =>
        cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cause.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter(cause => 
        cause.category?.name.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'target-high':
          return b.targetAmount - a.targetAmount;
        case 'target-low':
          return a.targetAmount - b.targetAmount;
        case 'progress-high':
          return (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount);
        case 'progress-low':
          return (a.currentAmount / a.targetAmount) - (b.currentAmount / b.targetAmount);
        default:
          return 0;
      }
    });

    setFilteredCauses(filtered);
  };

  const handleUnsaveCause = async (causeId) => {
    try {
      await axios.delete(`/donor/saved-causes/${causeId}`);
      setCauses(causes.filter(cause => cause._id !== causeId));
      toast.success('Cause removed from saved list');
    } catch (error) {
      console.error('Error removing cause:', error);
      toast.error(error.response?.data?.message || 'Failed to remove cause');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 items-center mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-center text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved causes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="disaster">Disaster Relief</SelectItem>
                <SelectItem value="animals">Animals</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="target-high">Target Amount (High to Low)</SelectItem>
                <SelectItem value="target-low">Target Amount (Low to High)</SelectItem>
                <SelectItem value="progress-high">Progress (High to Low)</SelectItem>
                <SelectItem value="progress-low">Progress (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Causes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCauses.length === 0 ? (
          <Card className="p-6 col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              {searchTerm || category ? 'No causes match your filters.' : 'No saved causes yet.'}
            </CardContent>
          </Card>
        ) : (
          filteredCauses.map((cause) => (
            <CauseCard
              key={cause._id}
              cause={cause}
              onUnsave={() => handleUnsaveCause(cause._id)}
              onShare={() => handleShare(cause)}
            />
          ))
        )}
      </div>
    </div>
  );
}

const CauseCard = ({ cause, onUnsave, onShare }) => {
  const progress = cause.targetAmount > 0 
    ? (cause.currentAmount / cause.targetAmount) * 100 
    : 0;

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
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-red-600"
            onClick={onUnsave}
          >
            <Heart className="h-4 w-4 fill-current" />
          </Button>
        </div>
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 bg-white/90"
        >
          {cause.category?.name}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{cause.title}</CardTitle>
        <CardDescription className="line-clamp-2">{cause.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-1 text-sm">
              <span className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                {(cause.currentAmount || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                {(cause.targetAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Created {formatDistanceToNow(new Date(cause.createdAt), { addSuffix: true })}</span>
            {cause.endDate && (
              <span>Ends {formatDistanceToNow(new Date(cause.endDate), { addSuffix: true })}</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={() => window.location.href = `/cause/${cause._id}`}
        >
          Donate Now
        </Button>
      </CardFooter>
    </Card>
  );
}; 