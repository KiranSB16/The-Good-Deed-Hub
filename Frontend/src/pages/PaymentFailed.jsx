import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-lg">
            We couldn't process your donation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Something went wrong while processing your payment. Don't worry, no charges were made.
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => window.history.back()}
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/causes')}
              className="w-full"
            >
              Browse Other Causes
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate('/donor/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentFailed; 