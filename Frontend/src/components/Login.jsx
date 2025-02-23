import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError, logout } from "../slices/authSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "react-toastify";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, user, isAuthenticated } = useSelector((state) => state.auth);

  // Check auth state validity on mount
  useEffect(() => {
    dispatch(clearError());
    
    // Check if the stored auth state is still valid
    if (isAuthenticated && user?.role) {
      const token = localStorage.getItem('token'); // or however you store your token
      if (!token) {
        // If no token exists, clear the auth state
        dispatch(logout());
      }
    }
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      const errorMessage = Array.isArray(error) 
        ? error[0]?.msg 
        : typeof error === 'string' 
          ? error 
          : error?.message || 'Login failed';
      
      toast.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectBasedOnRole = (role) => {
    console.log("Redirecting user with role:", role);
    const roleToPath = {
      'fundraiser': '/fundraiser/dashboard',
      'donor': '/donor/dashboard',
      'admin': '/admin/dashboard'
    };
    
    const path = roleToPath[role.toLowerCase()] || '/';
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    const errors = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (!validatePassword(password)) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      if (!result?.user?.role) {
        toast.error('Login successful but no role assigned. Please contact support.');
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center" 
           style={{ 
             backgroundImage: 'url("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1920&auto=format&fit=crop")',
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-indigo-900/70 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Welcome to Good Deed Hub</h2>
          <p className="text-xl mb-8">Where kindness meets opportunity. Join our community of changemakers.</p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-full mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <span>Connect with fellow philanthropists</span>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-full mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <span>Secure and transparent donations</span>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-full mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
              <span>Make a real impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="Good Deed Hub Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Welcome Back!</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Please sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-white/50 ${validationErrors.email ? "border-red-500" : ""}`}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-white/50 ${validationErrors.password ? "border-red-500" : ""}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Sign up
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;