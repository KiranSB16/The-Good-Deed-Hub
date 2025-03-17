import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';
import { toast } from 'react-hot-toast';

// Async thunks for API calls
export const fetchCauses = createAsyncThunk(
  'cause/fetchCauses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/causes');
      return response.data.causes;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch causes');
      return rejectWithValue(error.response?.data || 'Failed to fetch causes');
    }
  }
);

export const fetchPendingCauses = createAsyncThunk(
  'cause/fetchPendingCauses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/causes?status=pending');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch pending causes');
      return rejectWithValue(error.response?.data || 'Failed to fetch pending causes');
    }
  }
);

export const approveCause = createAsyncThunk(
  'cause/approveCause',
  async (causeId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/admin/causes/approve/${causeId}`);
      toast.success('Cause approved successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve cause');
      return rejectWithValue(error.response?.data || 'Failed to approve cause');
    }
  }
);

export const rejectCause = createAsyncThunk(
  'cause/rejectCause',
  async ({ causeId, rejectionMessage }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/admin/causes/reject/${causeId}`, {
        rejectionMessage
      });
      toast.success('Cause rejected successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject cause');
      return rejectWithValue(error.response?.data || 'Failed to reject cause');
    }
  }
);

const initialState = {
  causes: [],
  loading: false,
  error: null,
  selectedCause: null
};

const causeSlice = createSlice({
  name: 'cause',
  initialState,
  reducers: {
    setSelectedCause: (state, action) => {
      state.selectedCause = action.payload;
    },
    clearSelectedCause: (state) => {
      state.selectedCause = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Causes
      .addCase(fetchCauses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCauses.fulfilled, (state, action) => {
        state.loading = false;
        state.causes = action.payload;
      })
      .addCase(fetchCauses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pending Causes
      .addCase(fetchPendingCauses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingCauses.fulfilled, (state, action) => {
        state.loading = false;
        state.causes = action.payload;
      })
      .addCase(fetchPendingCauses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Cause
      .addCase(approveCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveCause.fulfilled, (state, action) => {
        state.loading = false;
        const approvedCause = action.payload.cause;
        state.causes = state.causes.filter(cause => cause._id !== approvedCause._id);
      })
      .addCase(approveCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject Cause
      .addCase(rejectCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectCause.fulfilled, (state, action) => {
        state.loading = false;
        const rejectedCause = action.payload.cause;
        state.causes = state.causes.filter(cause => cause._id !== rejectedCause._id);
        state.selectedCause = null;
      })
      .addCase(rejectCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSelectedCause, clearSelectedCause } = causeSlice.actions;
export default causeSlice.reducer; 