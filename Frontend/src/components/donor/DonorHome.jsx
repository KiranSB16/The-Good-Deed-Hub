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
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 9;

export default function DonorHome() {
  const { user } = useSelector((state) => state.auth);
  const [causes, setCauses] = useState([]);
  const [savedCauses, setSavedCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchSavedCauses();
  }, []);

  useEffect(() => {
    fetchCauses();
  }, [currentPage, searchTerm, category, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCauses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/causes/approved', {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          category,
          sort: sortBy,
          status: 'approved',
          active: true
        }
      });
      setCauses(response.data.causes);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching causes:', error);
      setError(error.response?.data?.message || 'Failed to load causes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCauses = async () => {
    try {
      const response = await axios.get('/donor/saved-causes');
      setSavedCauses(response.data.savedCauses.map(cause => cause._id));
    } catch (error) {
      console.error('Error fetching saved causes:', error);
    }
  };

  const handleSaveCause = async (causeId) => {
    try {
      if (savedCauses.includes(causeId)) {
        await axios.delete(`/donor/saved-causes/${causeId}`);
        setSavedCauses(savedCauses.filter(id => id !== causeId));
        toast.success('Cause removed from saved list');
      } else {
        await axios.post('/donor/saved-causes', { causeId });
        setSavedCauses([...savedCauses, causeId]);
        toast.success('Cause saved successfully');
      }
    } catch (error) {
      console.error('Error saving cause:', error);
      toast.error(error.response?.data?.message || 'Failed to save cause');
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCauses();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <form onSubmit={handleSearch} className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search causes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </form>
            <Select value={category} onValueChange={(value) => { setCategory(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
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
      {loading ? (
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
      ) : error ? (
        <Card className="p-6">
          <p className="text-center text-destructive">{error}</p>
        </Card>
      ) : causes.length === 0 ? (
        <Card className="p-6">
          <CardContent className="pt-6 text-center text-muted-foreground">
            {searchTerm || category ? 'No causes match your filters.' : 'No active causes available.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {causes.map((cause) => (
              <CauseCard
                key={cause._id}
                cause={cause}
                isSaved={savedCauses.includes(cause._id)}
                onSave={() => handleSaveCause(cause._id)}
                onShare={() => handleShare(cause)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const CauseCard = ({ cause, isSaved, onSave, onShare }) => {
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
            variant={isSaved ? "default" : "secondary"}
            size="icon"
            className={`h-8 w-8 ${isSaved ? 'bg-primary text-primary-foreground' : 'bg-white/90 hover:bg-white'}`}
            onClick={onSave}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
        {cause.category && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-white/90"
          >
            {cause.category.name}
          </Badge>
        )}
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
      <CardContent className="pt-0">
        <Button 
          className="w-full" 
          onClick={() => window.location.href = `/cause/${cause._id}`}
        >
          Donate Now
        </Button>
      </CardContent>
    </Card>
  );
}; 