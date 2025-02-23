import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/config/axios";

export const updateUserProfile = createAsyncThunk(
    "user/updateProfile",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.put("/api/users/profile", formData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const getUserProfile = createAsyncThunk(
    "user/getProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/api/users/profile");
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState: {
        profile: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
        clearUserProfile: (state) => {
            state.profile = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Update Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Profile
            .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUserError, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;