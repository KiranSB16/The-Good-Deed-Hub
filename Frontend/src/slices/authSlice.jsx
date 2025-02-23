import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/config/axios";

// Function to decode JWT token
const decodeToken = (token) => {
    if (!token) return null;
    
    try {
        const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const base64Url = actualToken.split('.')[1];
        if (!base64Url) return null;
        
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

// Validate token function
const validateToken = (token) => {
    if (!token) return false;
    
    const decoded = decodeToken(token);
    if (!decoded) return false;

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem('authToken');
        return false;
    }

    return true;
};

// Get initial state with validation
const getInitialState = () => {
    const token = localStorage.getItem('authToken');
    const isValid = validateToken(token);
    
    if (!isValid) {
        localStorage.removeItem('authToken');
        return {
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
        };
    }

    return {
        token: token,
        user: decodeToken(token),
        isAuthenticated: true,
        loading: false,
        error: null
    };
};

export const loginUser = createAsyncThunk(
    "auth/login",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post("/api/users/login", formData);
            const { token } = response.data;

            if (!token) {
                throw new Error('No token received from server');
            }

            // Store token with Bearer prefix
            const finalToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            
            // Validate token before storing
            if (!validateToken(finalToken)) {
                throw new Error('Invalid token received from server');
            }

            localStorage.setItem('authToken', finalToken);
            const userData = decodeToken(finalToken);

            return { token: finalToken, user: userData };
        } catch (err) {
            if (err.response?.data) {
                return rejectWithValue(err.response.data);
            }
            return rejectWithValue({ message: err.message });
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/register",
    async ({ formData, navigate }, { rejectWithValue }) => {
        try {
            const response = await axios.post("/api/users/register", formData);
            navigate('/login');
            return response.data;
        } catch (err) {
            if (err.response?.data) {
                return rejectWithValue(err.response.data);
            }
            return rejectWithValue({ message: err.message });
        }
    }
);

export const checkAuthStatus = createAsyncThunk(
    "auth/checkStatus",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token || !validateToken(token)) {
                throw new Error('No valid token found');
            }

            const response = await axios.get("/api/users/profile");
            return response.data;
        } catch (err) {
            localStorage.removeItem('authToken');
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: getInitialState(),
    reducers: {
        logout(state) {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('authToken');
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            })
            // Register cases
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check auth status cases
            .addCase(checkAuthStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(checkAuthStatus.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                state.error = action.payload;
            });
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;