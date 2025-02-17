import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from "@/components/ui/card";
import axios from '../config/axios';

const FundraiserProfile = () => {
  const { user } = useSelector((state) => state.user);
  const [profileData, setProfileData] = useState(null);
  const [profileStats, setProfileStats] = useState({
    totalCauses: 0,
    totalRaised: 0,
    approvedCauses: 0,
    pendingCauses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile data
        const profileResponse = await axios.get('/api/users/profile');
        setProfileData(profileResponse.data);
        
        // Fetch causes for statistics
        const causesResponse = await axios.get('/api/causes');
        const userCauses = causesResponse.data.filter(cause => cause.fundraiserId === user._id);
        
        // Calculate statistics
        const stats = {
          totalCauses: userCauses.length,
          totalRaised: userCauses.reduce((sum, cause) => sum + (cause.currentAmount || 0), 0),
          approvedCauses: userCauses.filter(cause => cause.status === 'approved').length,
          pendingCauses: userCauses.filter(cause => cause.status === 'pending approval').length
        };
        
        setProfileStats(stats);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchProfileData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Fundraiser Profile</h1>
        <Card className="p-6">
          <p className="text-center">Loading profile data...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Fundraiser Profile</h1>
        <Card className="p-6">
          <p className="text-center text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Fundraiser Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{profileData.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profileData.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{profileData.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(profileData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <span className="inline-block px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Causes</p>
              <p className="text-2xl font-semibold">{profileStats.totalCauses}</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Raised</p>
              <p className="text-2xl font-semibold">₹{profileStats.totalRaised.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Approved Causes</p>
              <p className="text-2xl font-semibold">{profileStats.approvedCauses}</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-semibold">{profileStats.pendingCauses}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Quick Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-medium">
                  {profileStats.totalCauses > 0
                    ? Math.round((profileStats.approvedCauses / profileStats.totalCauses) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Raised</span>
                <span className="font-medium">
                  ₹{profileStats.totalCauses > 0
                    ? Math.round(profileStats.totalRaised / profileStats.totalCauses).toLocaleString()
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FundraiserProfile;
