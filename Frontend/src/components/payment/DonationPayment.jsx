import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const DonationPayment = ({ causeId, cause, onSuccess, onCancel, initialAmount }) => {
  const [amount] = useState(initialAmount);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [platformFee] = useState(Math.round(initialAmount * 0.05));
  const [actualDonationAmount] = useState(initialAmount - Math.round(initialAmount * 0.05));
  const navigate = useNavigate();

  const handleDonate = async () => {
    try {
      setIsProcessing(true);
      const loadingToast = toast.loading('Preparing your donation...');

      // Ensure we have a valid cause ID
      const id = typeof causeId === 'object' ? causeId._id : causeId;

      // Create checkout session
      const { data } = await axios.post('/payments/create-checkout-session', {
        amount,
        causeId: id,
        isAnonymous,
        message
      });

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error.response?.data?.message || 'Could not process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 space-y-6">
          <div className="text-center">
            <DialogTitle className="text-xl font-semibold mb-2">Complete Your Donation</DialogTitle>
            <DialogDescription className="text-gray-600">
              You're making a difference in someone's life
            </DialogDescription>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">{cause?.title}</h3>
            <p className="text-sm text-gray-600">{cause?.description}</p>
            
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your Donation:</span>
                <span className="font-medium">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <span className="text-gray-600">Platform Fee (5%)</span>
                  <span className="ml-1 text-xs text-gray-500 cursor-help" title="This helps us maintain the platform and support more causes">ⓘ</span>
                </div>
                <span className="font-medium text-gray-600">₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                <div className="flex items-center">
                  <span>Amount to Cause</span>
                  <span className="ml-1 text-xs text-green-600">✓</span>
                </div>
                <span className="text-primary">₹{actualDonationAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Leave a message of support..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Make this donation anonymous
                </Label>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDonate}
                disabled={isProcessing}
                className="w-full py-6"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Proceed to Pay ₹${amount.toLocaleString('en-IN')}`
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPayment; 