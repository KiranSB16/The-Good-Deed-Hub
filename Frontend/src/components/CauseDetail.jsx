import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axios';
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
        const response = await axios.get(`/causes/${id}`);
        setCause(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const handleDonationSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(donationAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setShowDonateDialog(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setDonationAmount('');
    toast.success('Thank you for supporting this cause!');
    // Refresh the cause data
    window.location.reload();
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
                <span>{Math.round(calculateProgress(cause.raisedAmount || 0, cause.goalAmount))}%</span>
              </div>
              <Progress 
                value={calculateProgress(cause.raisedAmount || 0, cause.goalAmount)} 
                className="h-2"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm font-medium">
                  ₹{(cause.raisedAmount || 0).toLocaleString('en-IN')} raised
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
              {user?.role !== 'admin' && (
                <Button onClick={handleDonateClick} className="bg-primary text-primary-foreground">
                  Donate Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Amount Dialog */}
      <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
        <DialogContent>
          <DialogTitle>Make a Donation</DialogTitle>
          <form onSubmit={handleDonationSubmit}>
            <div className="space-y-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">{cause.title}</h3>
                <p className="text-sm text-gray-600">{cause.description}</p>
              </div>
              <div>
                <Label htmlFor="amount">Donation Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="100"
                  step="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount (minimum ₹100)"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Continue to Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Payment Details</DialogTitle>
          <DonationPayment
            amount={parseFloat(donationAmount)}
            causeId={cause._id}
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
