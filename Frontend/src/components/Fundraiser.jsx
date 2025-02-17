import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FundraiserNavbar from './FundraiserNavbar';
import FundraiserProfile from './FundraiserProfile';
import FundraiserCauses from './FundraiserCauses';

const FundraiserDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/create-cause')}
              className="w-full"
            >
              Create New Cause
            </Button>
            <Button
              onClick={() => navigate('/fundraiser/causes')}
              variant="outline"
              className="w-full"
            >
              View My Causes
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {user?.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{' '}
              <span className="capitalize">{user?.role}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Fundraiser = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  console.log({user})

  useEffect(() => {
    if (!user || user.role !== 'fundraiser') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div>
      <FundraiserNavbar />
      <Routes>
        <Route path="/" element={<FundraiserDashboard />} />
        <Route path="/profile" element={<FundraiserProfile />} />
        <Route path="/causes" element={<FundraiserCauses />} />
      </Routes>
    </div>
  );
};

export default Fundraiser;
