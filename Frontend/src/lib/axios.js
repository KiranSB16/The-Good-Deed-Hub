import axios from 'axios';
import { toast } from 'react-hot-toast';

const instance = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3800') + '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to include the auth token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ensure token is properly formatted
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            config.headers.Authorization = formattedToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
instance.interceptors.response.use(
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

export default instance; 