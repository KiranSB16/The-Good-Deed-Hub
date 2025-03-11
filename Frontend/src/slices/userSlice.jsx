import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

// Helper function to set token in localStorage and axios headers
const setAuthToken = (token) => {
  if (token) {
    // Store new token without double "Bearer" prefix
    const finalToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    localStorage.setItem('token', finalToken);
    axios.defaults.headers.common['Authorization'] = finalToken;
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Check for existing token on app load and set axios headers
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = token;
}

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

// Async thunks
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/users/login', credentials);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Set token in localStorage and axios headers
      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      // Return the error message from the server, or a default message if none exists
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.msg || 
        error.message || 
        'Invalid email or password'
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/users/register', userData);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Set token in localStorage and axios headers
      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Registration failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Remove token from localStorage and axios headers
      setAuthToken(null);
      localStorage.removeItem('user');
      return null;
    } catch (error) {
      console.error('Logout error:', error);
      return rejectWithValue('Logout failed');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.put('/users/profile', userData);
      const updatedUser = response.data;
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Update failed'
      );
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: user || null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.error = null;
      setAuthToken(null);
      localStorage.removeItem('user');
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      setAuthToken(null);
      localStorage.removeItem('user');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      })
      
      // Update cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearAuth, logout } = userSlice.actions;
export default userSlice.reducer;
