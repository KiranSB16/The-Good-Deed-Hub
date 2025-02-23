import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import fundraiserReducer from "./slices/fundraiserSlice";
import causeReducer from "./slices/causeSlice";
import adminReducer from "./slices/adminSlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer,
        fundraiser: fundraiserReducer,
        causes: causeReducer,
        admin: adminReducer,
        profile: profileReducer,
    },
});

export default store;