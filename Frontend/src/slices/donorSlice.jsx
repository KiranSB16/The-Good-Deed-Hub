import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchDonorProfile = createAsyncThunk(
  'donor/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/donor/profile');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateDonorProfile = createAsyncThunk(
  'donor/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put('/donor/profile', profileData);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchDonorDonations = createAsyncThunk(
  'donor/fetchDonations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/donor/donations');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch donations';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchDonorStats = createAsyncThunk(
  'donor/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/donor/stats');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch statistics';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  profile: null,
  donations: [],
  loading: false,
  error: null,
  stats: {
    totalDonations: 0,
    totalAmount: 0,
    completedDonations: 0,
    pendingDonations: 0
  },
};

const donorSlice = createSlice({
  name: 'donor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchDonorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchDonorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateDonorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDonorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.donor;
      })
      .addCase(updateDonorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Donations
      .addCase(fetchDonorDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonorDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = action.payload.donations;
        if (action.payload.stats) {
          state.stats = {
            ...state.stats,
            ...action.payload.stats
          };
        }
      })
      .addCase(fetchDonorDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchDonorStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonorStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDonorStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateStats } = donorSlice.actions;

export default donorSlice.reducer; 