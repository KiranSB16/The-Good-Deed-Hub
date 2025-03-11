import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../slices/userSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import * as Yup from "yup";
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must not exceed 50 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one symbol")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .required("Password is required"),
    role: Yup.string()
      .oneOf(["donor", "fundraiser"], "Role must be either donor or fundraiser")
      .required("Role is required"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      await axios.post('/users/register', formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setFormErrors(validationErrors);
      } else if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.path] = err.msg;
        });
        setFormErrors(serverErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Create an Account</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Join our community and start making a difference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg text-foreground">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`h-12 text-lg bg-input border-2 ${formErrors.name ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
                placeholder="Enter your name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`h-12 text-lg bg-input border-2 ${formErrors.email ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
                placeholder="Enter your email"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg text-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`h-12 text-lg bg-input border-2 ${formErrors.password ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
                placeholder="Create a password"
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-lg text-foreground">
                Role
              </Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`h-12 text-lg bg-input border-2 w-full rounded-md px-3 ${formErrors.role ? 'border-red-500' : 'border-border'} focus:border-blue-500`}
              >
                <option value="">Select your role</option>
                <option value="donor">Donor</option>
                <option value="fundraiser">Fundraiser</option>
              </select>
              {formErrors.role && (
                <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Sign in here
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;