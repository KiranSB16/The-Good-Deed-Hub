import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Calendar, User, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Progress } from '@/components/ui/progress';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DonationPayment from './payment/DonationPayment';
import { useNavigate } from 'react-router-dom';

const CauseDetail = () => {
  const { id } = useParams();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ensure we have a valid ID
        if (!id || typeof id === 'object') {
          toast.error('Invalid cause ID');
          navigate('/donor/dashboard');
          return;
        }
        const response = await axios.get(`/causes/${id}`);
        setCause(response.data);
      } catch (error) {
        console.error('Error fetching cause:', error);
        toast.error(error.response?.data?.message || 'Error fetching data');
        navigate('/donor/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const handleDonateClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/causes/${id}` } });
      return;
    }
    setShowDonateDialog(true);
  };

  const handleAmountSubmit = () => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount < 100) {
      toast.error('Please enter a valid amount (minimum ₹100)');
      return;
    }
    setShowDonateDialog(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    setShowPayment(false);
    setShowDonateDialog(false);
    setDonationAmount('');
    
    // Poll for updated cause data with increased timeout
    let retries = 0;
    const maxRetries = 10; // Increased from 5 to 10
    const pollInterval = 2000; // Increased from 1s to 2s
    const expectedAmount = (cause.currentAmount || 0) + parseFloat(donationAmount);

    const pollForUpdate = async () => {
      while (retries < maxRetries) {
        try {
          const response = await axios.get(`/causes/${id}`);
          const updatedCause = response.data;
          
          // Check if the amount has been updated
          if (updatedCause.currentAmount >= expectedAmount) {
            setCause(updatedCause);
            toast.success('Thank you for supporting this cause!');
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          retries++;
          
          // If we've reached max retries but still haven't seen the update
          if (retries === maxRetries) {
            // Fetch one final time
            const finalResponse = await axios.get(`/causes/${id}`);
            setCause(finalResponse.data);
            toast.success('Thank you for supporting this cause! The page will update shortly.');
          }
        } catch (error) {
          console.error('Error refreshing cause data:', error);
          if (retries === maxRetries) {
            toast.error('Please refresh the page to see your updated donation');
          }
        }
      }
    };

    // Start polling
    pollForUpdate();
    
    // Navigate to donations page
    navigate('/donor/dashboard/donations');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setDonationAmount('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cause) {
    return <p className="text-center text-red-500">Cause not found</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{cause.title}</CardTitle>
          <CardDescription>{cause.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold">{cause.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm ${
                cause.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {cause.status}
              </span>
            </div>

            {cause.images && cause.images.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cause.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${cause.title} - Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(calculateProgress(cause.currentAmount || 0, cause.goalAmount))}%</span>
              </div>
              <Progress 
                value={calculateProgress(cause.currentAmount || 0, cause.goalAmount)} 
                className="h-2"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm font-medium">
                  ₹{(cause.currentAmount || 0).toLocaleString('en-IN')} raised
                </span>
                <span className="text-sm text-gray-500">
                  of ₹{(cause.goalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About this cause</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{cause.description}</p>
            </div>

            {cause.documents && cause.documents.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Supporting Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cause.documents.map((doc, index) => (
                    <Button
                      key={index}
                      onClick={() => window.open(doc, '_blank')}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg w-full"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Download Document {index + 1}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Fundraiser Details</h2>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span>Created by: {cause.fundraiserId?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>Start Date: {new Date(cause.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>End Date: {new Date(cause.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-gray-500" />
                  <span>Category: {cause.category?.name || 'Uncategorized'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button onClick={() => window.history.back()} variant="outline">
                Back
              </Button>
              {user?.role !== 'admin' && cause.status === 'approved' && (
                <Button 
                  onClick={handleDonateClick}
                  className="bg-primary hover:bg-primary/90"
                >
                  Donate Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Input Dialog */}
      <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
        <DialogContent className="sm:max-w-md" description="Enter the amount you wish to donate">
          <DialogTitle>Enter Donation Amount</DialogTitle>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="donationAmount">Amount (₹)</Label>
              <Input
                id="donationAmount"
                type="number"
                min="100"
                step="1"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Enter amount (minimum ₹100)"
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Minimum donation amount is ₹100
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDonateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAmountSubmit}
                disabled={!donationAmount || parseFloat(donationAmount) < 100}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent 
          className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          description="Complete your donation payment securely"
        >
          <DonationPayment
            initialAmount={parseFloat(donationAmount)}
            causeId={cause?._id}
            cause={cause}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CauseDetail;
