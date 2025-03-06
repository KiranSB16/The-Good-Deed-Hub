import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

// Initialize Stripe with error handling
const getStripe = async () => {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    console.error('Stripe public key is missing');
    return null;
  }
  try {
    return await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  } catch (error) {
    console.error('Error loading Stripe:', error);
    return null;
  }
};

const stripePromise = getStripe();

const PaymentForm = ({ amount, causeId, cause, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donor/dashboard`,
          payment_method_data: {
            billing_details: {
              name: cause?.title || 'Donation',
            },
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        return;
      }

      // Payment successful
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await axios.post('/api/payments/payment-success', {
          paymentIntentId: paymentIntent.id,
          causeId,
          amount,
          message,
        });

        toast.success('Thank you for your generous donation! Your support makes a difference.');
        onSuccess();
        navigate('/donor/dashboard');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogTitle>Complete Your Donation</DialogTitle>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">{cause?.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{cause?.description}</p>
        <div className="text-primary font-semibold">
          Amount: ₹{amount.toLocaleString('en-IN')}
        </div>
      </div>

      <PaymentElement />
      
      <Textarea
        placeholder="Leave a message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mt-4"
      />

      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          'Complete Donation'
        )}
      </Button>
    </form>
  );
};

const DonationPayment = ({ amount, causeId, cause, onSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data } = await axios.post('/api/payments/create-payment-intent', {
          amount,
          causeId,
        });
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError(error.response?.data?.message || 'Could not initialize payment. Please try again.');
        onCancel();
      }
    };

    createPaymentIntent();
  }, [amount, causeId]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <DialogTitle>Error</DialogTitle>
        <DialogDescription>
          An error occurred while processing your payment
        </DialogDescription>
        <p className="text-red-500 mt-4">{error}</p>
        <Button onClick={onCancel} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col justify-center items-center p-8 space-y-4">
        <DialogTitle>Processing Payment</DialogTitle>
        <DialogDescription>
          Please wait while we process your payment request
        </DialogDescription>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
          },
          locale: 'en'
        }}
      >
        <DialogDescription className="text-sm text-gray-500 mb-4">
          Complete your donation securely using Stripe payment
        </DialogDescription>
        <PaymentForm
          amount={amount}
          causeId={causeId}
          cause={cause}
          onSuccess={onSuccess}
        />
      </Elements>

      <Button
        variant="ghost"
        className="mt-4 w-full"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
};

export default DonationPayment; 