import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FundraiserNavbar from './FundraiserNavbar';
import FundraiserProfile from './FundraiserProfile';
import FundraiserCauses from './FundraiserCauses';

const Fundraiser = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <FundraiserNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <div>
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
                    <p>Email: {user?.email}</p>
                    <Button
                      onClick={() => navigate('/fundraiser/profile')}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          } />
          <Route path="/profile" element={<FundraiserProfile />} />
          <Route path="/causes" element={<FundraiserCauses />} />
        </Routes>
      </div>
    </div>
  );
};

export default Fundraiser;
