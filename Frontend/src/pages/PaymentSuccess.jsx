import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate('/donor/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            Thank you for your generous donation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your donation has been processed successfully. You're making a real difference!
          </p>
          <div className="text-center text-sm text-muted-foreground">
            You will be redirected to your dashboard in a few seconds...
          </div>
          <div className="flex flex-col gap-2">
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
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentSuccess; 