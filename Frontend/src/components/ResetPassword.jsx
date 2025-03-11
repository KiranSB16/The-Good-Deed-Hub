import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import axios from '@/lib/axios';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('resetPasswordEmail');
    if (!storedEmail) {
      toast.error('Please request a password reset first');
      navigate('/forgot-password');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const validationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^\d{6}$/, 'OTP must be 6 digits')
      .required('OTP is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one symbol')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Please confirm your password')
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      
      console.log('Sending reset password request with:', {
        email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      const response = await axios.post('/auth/reset-password', {
        email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      if (response.data.message) {
        toast.success(response.data.message);
        // Clear the stored email
        localStorage.removeItem('resetPasswordEmail');
        navigate('/login');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.name === 'ValidationError') {
        const validationErrors = {};
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.errors) {
          console.log('Validation errors from server:', err.response.data.errors);
        }
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Enter the OTP sent to your email and set a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-lg text-foreground">
                OTP
              </Label>
              <Input
                id="otp"
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className={`h-12 text-lg bg-input border-2 ${errors.otp ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required={false}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-lg text-foreground">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`h-12 text-lg bg-input border-2 ${errors.newPassword ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
                placeholder="Enter new password"
                required={false}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-lg text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`h-12 text-lg bg-input border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
                placeholder="Confirm new password"
                required={false}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-muted-foreground">
            Didn't receive the OTP?{" "}
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Request again
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword; 