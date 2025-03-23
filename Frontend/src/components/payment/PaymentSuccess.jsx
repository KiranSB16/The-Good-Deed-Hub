import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { Loader2, CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verificationAttempts, setVerificationAttempts] = useState(0);
    const [isVerifying, setIsVerifying] = useState(true);
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const [donation, setDonation] = useState(null);

    // Use a callback for the verification function to avoid dependency issues
    const verifyPayment = useCallback(async () => {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
            toast.error('Session ID is missing');
            setIsVerifying(false);
            return;
        }

        try {
            const response = await axios.get(`/payments/verify-session/${sessionId}`);
            
            if (response.data.success && response.data.donation) {
                const { donation } = response.data;
                setDonation(donation);
                
                // Log the cause data for debugging
                console.log('Received cause data:', {
                    causeId: donation.causeId._id,
                    currentAmount: donation.causeId.currentAmount,
                    goalAmount: donation.causeId.goalAmount
                });

                toast.success('Payment verified successfully!');
                setIsVerifying(false);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            
            if (verificationAttempts < 2) {
                setVerificationAttempts(prev => prev + 1);
                setTimeout(() => verifyPayment(), 2000); // Retry after 2 seconds
            } else {
                toast.error('Failed to verify payment. Please contact support.');
                setIsVerifying(false);
            }
        }
    }, [searchParams, verificationAttempts]);

    // Create a separate callback for navigation to avoid setState in render
    const navigateToDonations = useCallback(() => {
        navigate('/donor/dashboard/donations', { replace: true });
    }, [navigate]);

    // Run verification on component mount
    useEffect(() => {
        verifyPayment();
    }, [verifyPayment]);

    // Handle countdown and redirection
    useEffect(() => {
        // Only start countdown when verification is complete
        if (!isVerifying) {
            const timer = setInterval(() => {
                setRedirectCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // Call the navigate callback instead of using navigate directly
                        setTimeout(navigateToDonations, 0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [isVerifying, navigateToDonations]);

    return (
        <div className="container mx-auto max-w-md px-4 py-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                {isVerifying ? (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h2 className="text-xl font-semibold">
                            Verifying your payment...
                        </h2>
                        {verificationAttempts > 0 && (
                            <p className="text-sm text-gray-500">
                                Retrying verification... Attempt {verificationAttempts + 1}/3
                            </p>
                        )}
                    </>
                ) : donation ? (
                    <>
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <h1 className="text-2xl font-bold text-primary">
                            Thank you for your donation!
                        </h1>
                        <p className="text-lg text-gray-700">
                            Your donation of ₹{donation.amount} to "{donation.causeId.title}" has been processed successfully.
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting to your donations page in {redirectCountdown} seconds...
                        </p>
                    </>
                ) : (
                    <div className="text-center text-red-600">
                        <h2 className="text-xl font-semibold">
                            Payment verification failed. Please contact support.
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Redirecting to dashboard in {redirectCountdown} seconds...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess; 