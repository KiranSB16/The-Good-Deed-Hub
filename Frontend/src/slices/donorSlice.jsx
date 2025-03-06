import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchDonorDonations = createAsyncThunk(
  'donor/fetchDonations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/donations/my-donations');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch donations';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchDonorProfile = createAsyncThunk(
  'donor/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/donor/profile');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Profile doesn't exist yet
      }
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

export const makeDonation = createAsyncThunk(
  'donor/makeDonation',
  async ({ causeId, amount, message }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/donations', {
        causeId,
        amount,
        message,
      });
      toast.success('Donation successful');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process donation';
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
      // Fetch Donations
      .addCase(fetchDonorDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonorDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = action.payload.donations || [];
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
      // Make Donation
      .addCase(makeDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makeDonation.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = [action.payload.donation, ...state.donations];
        // Update stats
        state.stats.totalDonations += 1;
        state.stats.totalAmount += action.payload.donation.amount;
        if (action.payload.donation.status === 'completed') {
          state.stats.completedDonations += 1;
        } else {
          state.stats.pendingDonations += 1;
        }
      })
      .addCase(makeDonation.rejected, (state, action) => {
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
        state.stats = {
          ...state.stats,
          ...action.payload
        };
      })
      .addCase(fetchDonorStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateStats } = donorSlice.actions;
export default donorSlice.reducer; 