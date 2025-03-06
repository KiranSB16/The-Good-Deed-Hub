import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [cause, setCause] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchCauseDetails = async () => {
      try {
        // Get data from navigation state or URL params
        const state = location.state;
        const searchParams = new URLSearchParams(location.search);
        
        const causeId = state?.causeId || searchParams.get('causeId');
        const amount = state?.amount || searchParams.get('amount');
        const transactionId = state?.transactionId || searchParams.get('transactionId');

        if (!causeId || !amount) {
          throw new Error('Missing required parameters');
        }

        // Update cause amount
        await axios.post(`/api/causes/${causeId}/donate`, {
          amount: parseFloat(amount),
          transactionId
        });

        // Fetch updated cause details
        const response = await axios.get(`/api/causes/${causeId}`);
        setCause({
          ...response.data,
          donationAmount: parseFloat(amount),
          transactionId
        });

        toast.success('Thank you for your donation!');
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          if (user?.role === 'donor') {
            navigate('/donor/dashboard');
          } else {
            navigate('/');
          }
        }, 3000);
      } catch (error) {
        console.error('Error processing donation:', error);
        toast.error('Failed to process donation. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    fetchCauseDetails();
  }, [location, navigate, user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Processing your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Donation Successful!
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Thank you for making a difference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cause && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">
                  Your donation of ₹{cause.donationAmount?.toLocaleString()} has been processed successfully.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">{cause.title}</h3>
                <p className="text-muted-foreground">{cause.description}</p>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Progress: ₹{cause.currentAmount?.toLocaleString()} / ₹{cause.targetAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="text-center text-sm text-muted-foreground">
            Redirecting to dashboard in a few seconds...
          </div>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => navigate(`/causes/${cause?._id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              View Cause Details
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(user?.role === 'donor' ? '/donor/dashboard' : '/')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess; 