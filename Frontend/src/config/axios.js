import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3800/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure token is properly formatted
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    
    if (error.response?.status === 401) {
      // Clear all auth-related items from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (!error.response) {
      toast.error('Network error. Please check your connection and ensure the backend server is running on port 3800.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;