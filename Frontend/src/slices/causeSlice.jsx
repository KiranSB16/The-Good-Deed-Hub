import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchCauses = createAsyncThunk(
  'causes/fetchAll',
  async ({ page = 1, search = '', category = '', sort = 'newest' }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/causes', {
        params: {
          page,
          search,
          category,
          sort
        }
      });
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
  async (causeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/causes/${causeId}`);
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
  async (causeData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/causes', causeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Cause created successfully');
      return response.data.cause;
    } catch (error) {
      console.error('Error creating cause:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Failed to create cause';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCause = createAsyncThunk(
  'causes/update',
  async ({ causeId, causeData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/causes/${causeId}`, causeData);
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
  async (causeId, { rejectWithValue }) => {
    try {
      await axios.delete(`/causes/${causeId}`);
      toast.success('Cause deleted successfully');
      return causeId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete cause';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const approveCause = createAsyncThunk(
  'causes/approve',
  async (causeId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/causes/${causeId}/approve`);
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
  async ({ causeId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/causes/${causeId}/reject`, { reason });
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
  selectedCause: null,
  loading: false,
  error: null
};

const causeSlice = createSlice({
  name: 'causes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCause: (state) => {
      state.selectedCause = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all causes
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

      // Fetch cause by ID
      .addCase(fetchCauseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCauseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCause = action.payload;
      })
      .addCase(fetchCauseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create cause
      .addCase(createCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCause.fulfilled, (state, action) => {
        state.loading = false;
        state.causes.push(action.payload);
      })
      .addCase(createCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update cause
      .addCase(updateCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCause.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.causes.findIndex(cause => cause._id === action.payload._id);
        if (index !== -1) {
          state.causes[index] = action.payload;
        }
        if (state.selectedCause?._id === action.payload._id) {
          state.selectedCause = action.payload;
        }
      })
      .addCase(updateCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete cause
      .addCase(deleteCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCause.fulfilled, (state, action) => {
        state.loading = false;
        state.causes = state.causes.filter(cause => cause._id !== action.payload);
        if (state.selectedCause?._id === action.payload) {
          state.selectedCause = null;
        }
      })
      .addCase(deleteCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve cause
      .addCase(approveCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveCause.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.causes.findIndex(cause => cause._id === action.payload.cause._id);
        if (index !== -1) {
          state.causes[index] = action.payload.cause;
        }
      })
      .addCase(approveCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reject cause
      .addCase(rejectCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectCause.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.causes.findIndex(cause => cause._id === action.payload.cause._id);
        if (index !== -1) {
          state.causes[index] = action.payload.cause;
        }
      })
      .addCase(rejectCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSelectedCause } = causeSlice.actions;

export default causeSlice.reducer; 