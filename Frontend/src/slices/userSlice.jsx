import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios.jsx";

// Function to decode JWT token
const decodeToken = (token) => {
    try {
        // Remove 'Bearer ' if present
        const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const base64Url = actualToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Get token from localStorage
const token = localStorage.getItem('authToken');

export const registerUser = createAsyncThunk(
    "user/register",
    async ({ formData, resetForm }, { rejectWithValue }) => {
        try {
            const response = await axios.post("/api/users/register", formData);
            resetForm();
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const loginUser = createAsyncThunk(
    "user/login",
    async ({ formData }, { rejectWithValue }) => {
        try {
            console.log('Sending login request with:', formData);
            
            const response = await axios.post("/api/users/login", formData);
            console.log('Raw server response:', response);
            
            const data = response.data;
            console.log('Response data:', data);

            if (!data.token) {
                throw new Error('No token received from server');
            }

            // Clean the token
            const cleanToken = data.token.startsWith('Bearer ') ? data.token.slice(7) : data.token;

            // Instead of creating a new user object from the token,
            // use the user object from the response
            const user = {
                _id: data.user._id,           // Changed from id to _id
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                createdAt: data.user.createdAt
            };

            localStorage.setItem("authToken", cleanToken);

            return {
                user,
                token: cleanToken
            };
        } catch (err) {
            console.error('Login error details:', {
                response: err.response,
                message: err.message,
                data: err.response?.data
            });
            
            return rejectWithValue({ 
                message: err.response?.data?.message || err.message || 'Login failed'
            });
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        token: token,
        isLoggedIn: false,
        loading: false,
        error: null
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;
            state.error = null;
            localStorage.removeItem("authToken");
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Register cases
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isLoggedIn = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isLoggedIn = false;
            })

        // Login cases
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.isLoggedIn = false;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                console.log('Login fulfilled with payload:', action.payload);
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isLoggedIn = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                console.log('Login rejected with payload:', action.payload);
                state.loading = false;
                state.error = action.payload;
                state.isLoggedIn = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem("authToken");
            });
    }
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;