import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchCauses = createAsyncThunk(
  'causes/fetchAll',
  async ({ page = 1, search = '', category = '', sort = 'newest', includeCompleted = true, status = '' }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/causes', {
        params: {
          page,
          search,
          category,
          sort,
          includeCompleted,
          status
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
      const response = await axios.put(`/causes/${causeId}/status`, { status: 'approved' });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve cause';
      return rejectWithValue(message);
    }
  }
);

export const rejectCause = createAsyncThunk(
  'causes/reject',
  async ({ causeId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/causes/${causeId}/status`, { status: 'rejected', reason });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject cause';
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
        // Ensure we're handling the API response structure correctly
        if (action.payload && action.payload.causes) {
          // If the API returns an object with a causes property
          state.causes = action.payload;
        } else if (Array.isArray(action.payload)) {
          // If the API returns an array directly
          state.causes = { causes: action.payload };
        } else {
          // Fallback
          state.causes = action.payload;
        }
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
        // Fix: Check if causes is an object with a causes property (from API) or just an array
        if (state.causes && state.causes.causes) {
          // If it's an object with a causes array property
          state.causes.causes = [...state.causes.causes, action.payload];
        } else if (Array.isArray(state.causes)) {
          // If it's a direct array
          state.causes = [...state.causes, action.payload];
        } else {
          // If it's neither, initialize it
          state.causes = { causes: [action.payload] };
        }
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