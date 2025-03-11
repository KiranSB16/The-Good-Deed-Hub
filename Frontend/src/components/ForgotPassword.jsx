import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import axios from '@/lib/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    
    try {
      await validationSchema.validate({ email }, { abortEarly: false });
      
      const response = await axios.post('/auth/forgot-password', { email });
      
      if (response.data.message) {
        toast.success(response.data.message);
        // Store email in localStorage for the reset password step
        localStorage.setItem('resetPasswordEmail', email);
        navigate('/reset-password');
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const validationErrors = {};
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-foreground">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Enter your email to receive a password reset OTP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 text-lg bg-input border-2 ${errors.email ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
                placeholder="Enter your email"
                required={false}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-muted-foreground">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Login here
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword; 