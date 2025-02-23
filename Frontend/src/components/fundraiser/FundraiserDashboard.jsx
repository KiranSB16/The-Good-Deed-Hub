import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { fetchProfile } from '@/slices/profileSlice';
import { getFundraiserData } from '@/slices/fundraiserSlice';

const FundraiserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentFundraiser, loading: fundraiserLoading, error: fundraiserError } = useSelector((state) => state.fundraiser);
  const { profile, loading: profileLoading, error: profileError } = useSelector((state) => state.profile);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Make sure user is a fundraiser
    if (user.role?.toLowerCase() !== 'fundraiser') {
      navigate('/');
      return;
    }

    // Only fetch data if we have a valid user
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProfile()),
          dispatch(getFundraiserData(user.id))
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [dispatch, user, isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const isLoading = fundraiserLoading || profileLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading your dashboard...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (fundraiserError || profileError) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-red-600">
              {(fundraiserError?.message || profileError?.message) || 'An error occurred while loading your dashboard'}
              <Button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white hover:bg-red-700"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentFundraiser) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-xl text-gray-600 mb-4">No fundraiser data found.</div>
            <Button 
              onClick={() => {
                dispatch(getFundraiserData(user.id));
                dispatch(fetchProfile());
              }}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Welcome, {profile?.name || user?.name || 'Fundraiser'}!</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Funds Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${currentFundraiser.totalRaised?.toLocaleString() || '0'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Causes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {currentFundraiser.causes?.length || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {currentFundraiser.totalDonors || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Causes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Causes</CardTitle>
            <CardDescription>Your current fundraising campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {currentFundraiser.causes?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentFundraiser.causes.map((cause) => (
                  <Card key={cause.id} className="bg-gray-50">
                    <CardHeader>
                      <CardTitle>{cause.title}</CardTitle>
                      <CardDescription>{cause.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">
                          ${cause.currentAmount?.toLocaleString() || '0'} / 
                          ${cause.targetAmount?.toLocaleString() || '0'}
                        </p>
                        <Button
                          onClick={() => navigate(`/cause/${cause.id}`)}
                          variant="outline"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No active causes. Create one to start fundraising!</p>
                <Button 
                  onClick={() => navigate('/cause/create')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  Create New Cause
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your causes</CardDescription>
          </CardHeader>
          <CardContent>
            {currentFundraiser.recentActivity?.length > 0 ? (
              <div className="space-y-4">
                {currentFundraiser.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-semibold">{activity.type}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FundraiserDashboard;