import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold">
                Good Deed Hub
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link 
                to="/fundraiser/causes" 
                className="text-gray-600 hover:text-gray-900"
              >
                My Causes
              </Link>
              <Link 
                to="/create-cause" 
                className="text-gray-600 hover:text-gray-900"
              >
                Create Cause
              </Link>
              <Link 
                to="/fundraiser/profile" 
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
