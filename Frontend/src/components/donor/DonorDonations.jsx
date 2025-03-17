import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { fetchDonorDonations } from '@/slices/donorSlice';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const DonorDonations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { donations, loading } = useSelector((state) => state.donor);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">My Donations</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Donated</CardTitle>
            <CardDescription>Amount contributed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Successful donations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedDonations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>In-progress donations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingDonations}</p>
          </CardContent>
        </Card>
      </div>

      {/* Donations List */}
      <div className="grid gap-6">
        {donations.map((donation) => (
          <Card key={donation._id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {donation.causeId?.title || 'Untitled Cause'}
                    </h3>
                    <p className="text-muted-foreground">
                      {donation.message || 'No message provided'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">
                      ₹{donation.amount.toLocaleString()}
                    </span>
                    <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'} className={donation.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Button
                  className="shrink-0"
                  onClick={() => navigate(`/causes/${donation.causeId?._id}`)}
                >
                  View Cause
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {donations.length === 0 && (
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