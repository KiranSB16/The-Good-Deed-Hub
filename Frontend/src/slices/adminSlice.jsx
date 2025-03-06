import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

// Remove feedback-related thunks and keep other thunks
export const fetchStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/stats');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch stats');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/users');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'admin/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/categories');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/admin/categories', categoryData);
      toast.success('Category created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'admin/updateCategory',
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/admin/categories/${categoryId}`, categoryData);
      toast.success('Category updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/admin/categories/${categoryId}`);
      toast.success('Category deleted successfully');
      return { ...response.data, categoryId };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    categories: [],
    loading: false,
    error: null,
    stats: {
      totalUsers: 0,
      totalCauses: 0,
      totalDonations: 0,
      totalAmount: 0,
      pendingCauses: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch stats';
      })
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users';
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch categories';
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload.category);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create category';
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(cat => cat._id === action.payload.category._id);
        if (index !== -1) {
          state.categories[index] = action.payload.category;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update category';
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(cat => cat._id !== action.payload.categoryId);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete category';
      });
  }
});

export const { clearError, updateStats } = adminSlice.actions;
export default adminSlice.reducer; 