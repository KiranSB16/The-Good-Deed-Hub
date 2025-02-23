import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/config/axios";

// Async thunk for fundraiser operations
export const getFundraiserData = createAsyncThunk(
    "fundraiser/getData",
    async (fundraiserId, { rejectWithValue }) => {
        try {
            if (!fundraiserId) {
                throw new Error('Fundraiser ID is required');
            }
            const response = await axios.get(`/api/fundraiser/${fundraiserId}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const createFundraiser = createAsyncThunk(
    "fundraiser/create",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post("/api/fundraiser/create", formData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

const fundraiserSlice = createSlice({
    name: "fundraiser",
    initialState: {
        currentFundraiser: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearFundraiserError: (state) => {
            state.error = null;
        },
        clearFundraiserData: (state) => {
            state.currentFundraiser = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Fundraiser Data
            .addCase(getFundraiserData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFundraiserData.fulfilled, (state, action) => {
                state.loading = false;
                state.currentFundraiser = action.payload;
            })
            .addCase(getFundraiserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.currentFundraiser = null;
            })
            // Create Fundraiser
            .addCase(createFundraiser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFundraiser.fulfilled, (state, action) => {
                state.loading = false;
                state.currentFundraiser = action.payload;
            })
            .addCase(createFundraiser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearFundraiserError, clearFundraiserData } = fundraiserSlice.actions;
export default fundraiserSlice.reducer;
