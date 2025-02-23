import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../config/axios';

// Cause Management Thunks
export const approveCause = createAsyncThunk(
    'admin/approveCause',
    async (causeId, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`/api/admin/causes/approve/${causeId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const rejectCause = createAsyncThunk(
    'admin/rejectCause',
    async ({ causeId, rejectionMessage }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`/api/admin/causes/reject/${causeId}`, {
                rejectionMessage
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Category Management Thunks
export const createCategory = createAsyncThunk(
    'admin/createCategory',
    async (name, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/categories', { name });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'admin/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/categories');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'admin/deleteCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`/api/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        loading: false,
        error: null,
        successMessage: null,
        categories: [],
        categoryLoading: false,
        categoryError: null,
    },
    reducers: {
        clearAdminMessages: (state) => {
            state.error = null;
            state.successMessage = null;
            state.categoryError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Approve Cause
            .addCase(approveCause.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(approveCause.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(approveCause.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reject Cause
            .addCase(rejectCause.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(rejectCause.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(rejectCause.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Category
            .addCase(createCategory.pending, (state) => {
                state.categoryLoading = true;
                state.categoryError = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categoryLoading = false;
                state.categories.push(action.payload.data);
                state.successMessage = action.payload.message;
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.categoryLoading = false;
                state.categoryError = action.payload;
            })
            // Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.categoryLoading = true;
                state.categoryError = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categoryLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.categoryLoading = false;
                state.categoryError = action.payload;
            })
            // Delete Category
            .addCase(deleteCategory.pending, (state) => {
                state.categoryLoading = true;
                state.categoryError = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categoryLoading = false;
                state.categories = state.categories.filter(cat => cat._id !== action.payload._id);
                state.successMessage = "Category deleted successfully";
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.categoryLoading = false;
                state.categoryError = action.payload;
            });
    },
});

export const { clearAdminMessages } = adminSlice.actions;
export default adminSlice.reducer;
