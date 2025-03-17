import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import Badge from '@/components/ui/badge';
import { Loader2, Heart, ChevronLeft, ChevronRight, Calendar, Users, FileText, IndianRupee, Search, SlidersHorizontal } from 'lucide-react';
import { fetchCauses } from '@/slices/causeSlice';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DonorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [savedCauses, setSavedCauses] = useState([]);
  const [selectedCause, setSelectedCause] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user } = useSelector((state) => state.user);
  const { causes, loading: causesLoading } = useSelector((state) => state.causes);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [donations, setDonations] = useState([]);
  const location = useLocation();

  // Pagination and filter states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  // Function to refresh causes data
  const refreshCauses = async () => {
    try {
      setLoading(true);
      const result = await dispatch(fetchCauses({ 
        page, 
        search, 
        category: category === 'all' ? undefined : category,
        sort 
      })).unwrap();
      
      if (result) {
        setTotalPages(result.totalPages);
      }
      
      if (user) {
        await fetchSavedCauses();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to fetch causes');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshCauses();
    }, search ? 500 : 0); // Only debounce search, not other filters

    return () => clearTimeout(timer);
  }, [search, category, sort, page]);

  // Handle payment success refresh
  useEffect(() => {
    if (location.state?.fromPayment) {
      refreshCauses();
    }
  }, [location.state]);

  const fetchSavedCauses = async () => {
    try {
      const response = await axios.get('/donors/saved-causes');
      if (response.data.savedCauses) {
        setSavedCauses(response.data.savedCauses.map(cause => cause._id));
      } else {
        console.warn('No saved causes data received:', response.data);
        setSavedCauses([]);
      }
    } catch (error) {
      console.error('Error fetching saved causes:', error);
      setSavedCauses([]);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      toast.error('Failed to fetch saved causes');
    }
  };

  const handleSaveCause = async (causeId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (savedCauses.includes(causeId)) {
        await axios.delete(`/donors/saved-causes/${causeId}`);
        setSavedCauses(savedCauses.filter(id => id !== causeId));
        toast.success('Cause removed from saved list');
      } else {
        const response = await axios.post('/donors/save-cause', { causeId });
        console.log('Save cause response:', response.data);
        setSavedCauses([...savedCauses, causeId]);
        toast.success('Cause saved successfully');
      }
    } catch (error) {
      console.error('Error saving cause:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      toast.error(error.response?.data?.message || 'Failed to save cause');
    }
  };

  const handleDonateClick = (causeId) => {
    if (!user) {
      navigate('/login', { state: { from: `/causes/${causeId}` } });
      return;
    }
    const id = typeof causeId === 'object' ? causeId._id : causeId;
    navigate(`/causes/${id}`);
  };

  const handleViewDetails = async (cause) => {
    setSelectedCause(cause);
    setShowDetailsDialog(true);
    setCurrentImageIndex(0);
    
    try {
      // Fetch donations for this cause
      const response = await axios.get(`/causes/${cause._id}/donations`);
      setDonations(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to fetch donation details');
    }
  };

  const nextImage = () => {
    if (selectedCause?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedCause.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedCause?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedCause.images.length - 1 : prev - 1
      );
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1); // Reset to first page when changing category
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1); // Reset to first page when changing sort
  };

  if (loading || causesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.name || 'Guest'}!</h1>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search causes..."
                value={search}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Causes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {causes?.causes?.map((cause) => (
          <Card key={cause._id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={cause.images?.[0] || '/placeholder.jpg'}
                alt={cause.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant={savedCauses.includes(cause._id) ? "default" : "secondary"}
                  size="icon"
                  className={`h-8 w-8 shadow-md ${
                    savedCauses.includes(cause._id) 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-white hover:bg-gray-100 text-red-500'
                  }`}
                  onClick={() => handleSaveCause(cause._id)}
                >
                  <Heart 
                    className="h-5 w-5" 
                    fill={savedCauses.includes(cause._id) ? "currentColor" : "none"} 
                  />
                </Button>
              </div>
              <Badge className="absolute top-2 left-2">
                {cause.category?.name}
              </Badge>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{cause.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {cause.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(((cause.currentAmount || 0) / (cause.goalAmount || 1)) * 100)}%</span>
                </div>
                <Progress value={((cause.currentAmount || 0) / (cause.goalAmount || 1)) * 100} />
                <div className="flex justify-between text-sm">
                  <span>Raised: ₹{cause.currentAmount || 0}</span>
                  <span>Goal: ₹{cause.goalAmount || 0}</span>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => handleDonateClick(cause._id)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {causes?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {causes.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(causes.totalPages, p + 1))}
            disabled={page === causes.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCause?.title}</DialogTitle>
            <DialogDescription>
              Created by {selectedCause?.fundraiser?.name} on {selectedCause?.createdAt && format(new Date(selectedCause.createdAt), 'PPP')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCause && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Images and Details */}
              <div className="space-y-6">
                {/* Image Slideshow */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedCause.images?.[currentImageIndex] || '/placeholder.jpg'}
                    alt={`${selectedCause.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedCause.images?.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {selectedCause.images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full ${
                              idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Cause Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About this Cause</h3>
                    <p className="text-gray-600">{selectedCause.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(selectedCause.createdAt), 'PP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Total Donors</p>
                        <p className="text-sm text-gray-600">{donations.length}</p>
                      </div>
                    </div>
                  </div>

                  {selectedCause.documents?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Documents</h3>
                      <div className="space-y-2">
                        {selectedCause.documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50"
                          >
                            <FileText className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">{doc.name || `Document ${idx + 1}`}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Donations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Recent Donations</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {donations.map((donation) => (
                        <div key={donation._id} className="flex justify-between items-center p-2 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {donation.donorId?.profileImage ? (
                              <img 
                                src={donation.donorId.profileImage} 
                                alt={donation.donorId.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {donation.donorId?.name?.charAt(0) || 'A'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{donation.donorId?.name}</p>
                              <p className="text-sm text-gray-600">{format(new Date(donation.createdAt), 'PP')}</p>
                              {donation.message && (
                                <p className="text-sm text-gray-600 mt-1 italic">"{donation.message}"</p>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold">₹{donation.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      {donations.length === 0 && (
                        <p className="text-sm text-gray-500 text-center">No donations yet. Be the first to donate!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Donation Section */}
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Fundraising Progress</h3>
                      <Progress 
                        value={((selectedCause.currentAmount || 0) / (selectedCause.goalAmount || 1)) * 100} 
                        className="h-2 mb-2"
                      />
                      <div className="flex justify-between text-sm">
                        <span>Raised: ₹{selectedCause.currentAmount?.toLocaleString() || 0}</span>
                        <span>Goal: ₹{selectedCause.goalAmount?.toLocaleString() || 0}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        className="w-full h-12 text-lg"
                        onClick={() => handleDonateClick(selectedCause._id)}
                      >
                        <IndianRupee className="h-5 w-5 mr-2" />
                        Donate Now
                      </Button>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-2">About the Fundraiser</h4>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden">
                          <img
                            src={selectedCause.fundraiser?.profileImage || '/placeholder-avatar.jpg'}
                            alt={selectedCause.fundraiser?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{selectedCause.fundraiser?.name}</p>
                          <p className="text-sm text-gray-600">{selectedCause.fundraiser?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Additional Information */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Important Information</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• All donations are securely processed</li>
                    <li>• 5% platform fee applies to all donations</li>
                    <li>• Tax receipts will be provided for donations</li>
                    <li>• You can track your donation in your dashboard</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {causes?.causes?.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No causes found</p>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard; 