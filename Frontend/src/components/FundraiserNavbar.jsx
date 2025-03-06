import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/slices/userSlice';
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';

const FundraiserNavbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-background border-b mb-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/fundraiser"
              className={`px-4 py-2 rounded-md ${isActive('/fundraiser')}`}
            >
              Dashboard
            </Link>
            <Link
              to="/fundraiser/profile"
              className={`px-4 py-2 rounded-md ${isActive('/fundraiser/profile')}`}
            >
              Profile
            </Link>
            <Link
              to="/fundraiser/causes"
              className={`px-4 py-2 rounded-md ${isActive('/fundraiser/causes')}`}
            >
              My Causes
            </Link>
            <Link
              to="/fundraiser/reviews"
              className={`px-4 py-2 rounded-md ${isActive('/fundraiser/reviews')}`}
            >
              Reviews
            </Link>
            <Link
              to="/create-cause"
              className={`px-4 py-2 rounded-md ${isActive('/create-cause')}`}
            >
              Create Cause
            </Link>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="px-4 py-2"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default FundraiserNavbar;
