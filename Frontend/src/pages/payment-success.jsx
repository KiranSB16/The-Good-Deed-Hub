import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate('/donor/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Thank You for Your Donation!</h1>
        <p className="text-gray-600 mb-6">
          Your generous contribution will make a real difference. We've sent you a confirmation email with the details.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/donor/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/causes')}
            className="w-full"
          >
            Explore More Causes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess; 