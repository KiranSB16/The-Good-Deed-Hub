import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { fetchDonorDonations } from '@/slices/donorSlice';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

const DonorDonations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { donations, loading } = useSelector((state) => state.donor);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDonations, setFilteredDonations] = useState([]);

  useEffect(() => {
    const loadDonations = async () => {
      try {
        await dispatch(fetchDonorDonations()).unwrap();
      } catch (error) {
        toast.error('Failed to fetch donations');
      }
    };

    loadDonations();
  }, [dispatch]);

  useEffect(() => {
    if (donations) {
      let filtered = [...donations];

      if (searchTerm) {
        filtered = filtered.filter(donation =>
          donation.causeId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      switch (sortBy) {
        case 'latest':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'amount-high':
          filtered.sort((a, b) => b.amount - a.amount);
          break;
        case 'amount-low':
          filtered.sort((a, b) => a.amount - b.amount);
          break;
        default:
          break;
      }

      setFilteredDonations(filtered);
    }
  }, [donations, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);
  const currentDonations = filteredDonations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;

  return (
    <div className="container mx-auto p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {donations.length} donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDonations}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDonations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
            <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Donations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDonations.map((donation) => (
          <Card key={donation._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{donation.causeId?.title || 'Untitled Cause'}</CardTitle>
              <CardDescription>
                {new Date(donation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    ₹{donation.amount.toLocaleString()}
                  </div>
                  {donation.message && (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      "{donation.message}"
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full ${
                    donation.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {donation.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/causes/${donation.causeId?._id}`)}
                  >
                    View Cause
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {currentDonations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No donations found</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/causes')}
          >
            Explore Causes to Support
          </Button>
        </div>
      )}
    </div>
  );
};

export default DonorDonations; 