import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

// Async thunks
export const uploadFiles = createAsyncThunk(
  'causes/uploadFiles',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Files uploaded successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload files';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchCauses = createAsyncThunk(
  'causes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/causes');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch causes';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchCauseById = createAsyncThunk(
  'causes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/causes/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch cause';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createCause = createAsyncThunk(
  'causes/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/causes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Cause created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create cause';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCause = createAsyncThunk(
  'causes/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/causes/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Cause updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cause';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteCause = createAsyncThunk(
  'causes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/causes/${id}`);
      toast.success('Cause deleted successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete cause';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchPendingCauses = createAsyncThunk(
  'causes/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      console.log('CauseSlice - Fetching pending causes from:', '/causes?status=pending approval');
      const response = await axios.get('/causes?status=pending approval');
      console.log('CauseSlice - Pending causes response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      if (!response.data) {
        console.error('CauseSlice - No data received from server');
        throw new Error('No data received from server');
      }
      
      console.log('CauseSlice - Successfully fetched pending causes:', {
        count: response.data?.length || 0,
        causes: response.data
      });
      
      return response.data || [];
    } catch (error) {
      console.error('CauseSlice - Error fetching pending causes:', {
        message: error.message,
        response: {
          data: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        },
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      const message = error.response?.data?.message || 'Failed to fetch pending causes';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const approveCause = createAsyncThunk(
  'causes/approve',
  async (causeId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/admin/causes/approve/${causeId}`);
      toast.success('Cause approved successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve cause';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const rejectCause = createAsyncThunk(
  'causes/reject',
  async ({ causeId, rejectionMessage }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/admin/causes/reject/${causeId}`, {
        rejectionMessage
      });
      toast.success('Cause rejected successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject cause';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  causes: [],
  currentCause: null,
  selectedCause: null,
  loading: false,
  error: null,
};

const causeSlice = createSlice({
  name: 'causes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCause: (state) => {
      state.currentCause = null;
    },
    setSelectedCause: (state, action) => {
      state.selectedCause = action.payload;
    },
    clearSelectedCause: (state) => {
      state.selectedCause = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Causes
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
      // Fetch Single Cause
      .addCase(fetchCauseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCauseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCause = action.payload;
      })
      .addCase(fetchCauseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Cause
      .addCase(createCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCause.fulfilled, (state, action) => {
        state.loading = false;
        state.causes.push(action.payload.cause);
      })
      .addCase(createCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Cause
      .addCase(updateCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCause.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.causes.findIndex(cause => cause._id === action.payload.cause._id);
        if (index !== -1) {
          state.causes[index] = action.payload.cause;
        }
        if (state.currentCause?._id === action.payload.cause._id) {
          state.currentCause = action.payload.cause;
        }
      })
      .addCase(updateCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Cause
      .addCase(deleteCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCause.fulfilled, (state, action) => {
        state.loading = false;
        state.causes = state.causes.filter(cause => cause._id !== action.payload);
        if (state.currentCause?._id === action.payload) {
          state.currentCause = null;
        }
      })
      .addCase(deleteCause.rejected, (state, action) => {
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
        state.causes = state.causes.filter(cause => cause._id !== action.payload.cause._id);
        state.selectedCause = null;
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
        state.causes = state.causes.filter(cause => cause._id !== action.payload.cause._id);
        state.selectedCause = null;
      })
      .addCase(rejectCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCause, setSelectedCause, clearSelectedCause } = causeSlice.actions;
export default causeSlice.reducer; 