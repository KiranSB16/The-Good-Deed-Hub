import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from 'date-fns';
import FundraiserNavbar from './FundraiserNavbar';
import FundraiserProfile from './FundraiserProfile';
import FundraiserCauses from './FundraiserCauses';
import axios from '@/lib/axios';
import EditCause from './EditCause';
import FundraiserDashboard from './FundraiserDashboard';

// Remove the FundraiserDashboard component definition
// const FundraiserDashboard = () => {
//   ...existing code...
// };

const CauseCard = ({ cause }) => {
  if (!cause) return null;

  const progress = cause.targetAmount > 0 
    ? (cause.currentAmount / cause.targetAmount) * 100 
    : 0;

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={cause.images?.[0] || '/placeholder-image.jpg'} 
          alt={cause.title} 
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold truncate">{cause.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{cause.description}</p>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-sm">
            <span>₹{(cause.currentAmount || 0).toLocaleString()}</span>
            <span>₹{(cause.targetAmount || 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(cause.createdAt || Date.now()), { addSuffix: true })}
        </div>
      </div>
    </Card>
  );
};

const Fundraiser = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'fundraiser') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <FundraiserNavbar />
      <Routes>
        <Route index element={<FundraiserDashboard />} />
        <Route path="profile" element={<FundraiserProfile />} />
        <Route path="causes" element={<FundraiserCauses />} />
        <Route path="causes/edit/:id" element={<EditCause />} />
      </Routes>
    </div>
  );
};

export default Fundraiser;
