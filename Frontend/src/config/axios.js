import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3800",
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Check if token starts with 'Bearer'
      const finalToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = finalToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;