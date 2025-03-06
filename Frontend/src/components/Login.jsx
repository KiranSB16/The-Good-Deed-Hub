import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../slices/userSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import * as Yup from "yup";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, user } = useSelector((state) => state.user);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
  });

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token) {
      const redirectPath = getDefaultRoute(user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const getDefaultRoute = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'fundraiser':
        return '/fundraiser';
      case 'donor':
        return '/donor';
      default:
        return '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      await validationSchema.validate({ email, password }, { abortEarly: false });
      await dispatch(loginUser({ email, password })).unwrap();
      toast.success('Login successful!');
      // Navigation will be handled by the useEffect above
    } catch (err) {
      if (err.name === 'ValidationError') {
        const validationErrors = {};
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else if (err.response?.data?.errors) {
        // Handle server-side validation errors
        const serverErrors = {};
        err.response.data.errors.forEach(error => {
          serverErrors[error.path] = error.msg;
        });
        setErrors(serverErrors);
      } else if (err.response?.data?.message) {
        // Handle server-side error message
        setErrors({ general: err.response.data.message });
      } else if (err.message) {
        // Handle other error messages
        setErrors({ general: err.message });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Sign in to continue your journey of making a difference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-12 text-lg bg-input border-2 ${errors.password ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
                placeholder="Enter your password"
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            {errors.general && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
                {errors.general}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Register here
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;