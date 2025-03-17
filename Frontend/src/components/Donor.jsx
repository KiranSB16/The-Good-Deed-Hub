import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useSelector, useDispatch } from 'react-redux';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DonorProfile from './DonorProfile';
import { Loader2 } from 'lucide-react';
import { logout } from '@/slices/userSlice';
import { fetchDonorDonations, fetchDonorProfile, fetchDonorStats } from '../slices/donorSlice';

const Donor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, donations, stats, loading, error } = useSelector((state) => state.donor);
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await Promise.all([
          dispatch(fetchDonorProfile()),
          dispatch(fetchDonorDonations()),
          dispatch(fetchDonorStats())
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totalDonationAmount = donations.reduce((total, donation) => total + donation.amount, 0);
  const uniqueCausesCount = new Set(donations.map(donation => donation.causeId?._id)).size;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Donor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DonorProfile />

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total Amount Donated</h2>
          <div className="text-4xl font-bold text-primary">
            ₹{totalDonationAmount.toLocaleString()}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Causes Supported</h2>
          <div className="text-4xl font-bold text-primary">
            {uniqueCausesCount}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Recent Donations</h2>
          {donations.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-gray-500">No donations yet. Start making a difference today!</p>
              <div className="mt-4 flex justify-center">
                <Button onClick={() => navigate('/causes')}>
                  Browse Causes
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <Card key={donation._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{donation.causeId?.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                      {donation.message && (
                        <p className="text-sm text-gray-600 mt-2">{donation.message}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        ₹{donation.amount.toLocaleString()}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="mt-2"
                        onClick={() => navigate(`/causes/${donation.causeId?._id}`)}
                      >
                        View Cause
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={handleLogout}
        variant="destructive"
        className="px-4 py-2 mt-4"
      >
        Logout
      </Button>
    </div>
  );
};

export default Donor;
