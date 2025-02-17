
// causeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../config/axios';

export const fetchCauses = createAsyncThunk(
  'causes/fetchCauses',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching causes...');
      const response = await axios.get('/api/causes');
      console.log('Causes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching causes:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadFiles = createAsyncThunk(
  'causes/uploadFiles',
  async (formData, { rejectWithValue }) => {
    try {
      // Log the FormData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post('/api/upload', formData);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
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
      console.log("inside the dispatch")

      // Append text fields
      Object.keys(causeData).forEach((key) => {
        if (key !== 'images' && key !== 'documents') {
          formData.append(key, causeData[key]);
        }
      });

      // Append each image file
      causeData.images?.forEach((image) => {
        formData.append('images', image);
      });

      // Append each document file
      causeData.documents?.forEach((doc) => {
        formData.append('documents', doc);
      });

      console.log("before the api call")

      // Make a single API call with all data
      const response = await axios.post('/api/causes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Create cause error:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create cause',
        error: error.response?.data?.error || error.message
      });
    }
  }
);

const causeSlice = createSlice({
  name: 'causes',
  initialState: {
    causes: [],
    loading: false,
    error: null,
    uploadLoading: false,
    uploadError: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      state.error = action.payload?.message || 'Failed to fetch causes';
    })
      // ... existing fetchCauses cases ...
      
      .addCase(uploadFiles.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadFiles.fulfilled, (state) => {
        state.uploadLoading = false;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload?.message || 'Failed to upload files';
      })
      
      // Create cause cases
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
        state.error = action.payload?.message || 'Failed to create cause';
      });
  },
});

export const { clearError } = causeSlice.actions;
export default causeSlice.reducer;