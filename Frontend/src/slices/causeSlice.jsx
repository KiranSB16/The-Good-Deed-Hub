import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/config/axios';

export const fetchCauses = createAsyncThunk(
  'causes/fetchCauses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/causes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadFiles = createAsyncThunk(
  'causes/uploadFiles',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/upload', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { 
        message: 'File upload failed',
        error: error.message 
      });
    }
  }
);

export const createCause = createAsyncThunk(
  'causes/createCause',
  async (causeData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append text fields
      Object.keys(causeData).forEach((key) => {
        if (key !== 'images' && key !== 'documents') {
          formData.append(key, causeData[key]);
        }
      });

      // Append images
      if (causeData.images) {
        causeData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      // Append documents
      if (causeData.documents) {
        causeData.documents.forEach((doc) => {
          formData.append('documents', doc);
        });
      }

      const response = await axios.post('/api/causes', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { 
        message: 'Failed to create cause',
        error: error.message 
      });
    }
  }
);

const causeSlice = createSlice({
  name: 'causes',
  initialState: {
    causes: [],
    currentCause: null,
    loading: false,
    error: null,
    uploadStatus: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
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
      // Upload Files
      .addCase(uploadFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadStatus = 'success';
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadStatus = 'failed';
      })
      // Create Cause
      .addCase(createCause.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCause.fulfilled, (state, action) => {
        state.loading = false;
        state.causes.push(action.payload);
        state.currentCause = action.payload;
      })
      .addCase(createCause.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = causeSlice.actions;
export default causeSlice.reducer;
