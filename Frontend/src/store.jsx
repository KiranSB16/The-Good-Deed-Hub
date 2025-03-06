import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice.jsx";
import causeReducer from "./slices/causeSlice.jsx";
import donorReducer from "./slices/donorSlice.jsx";
import adminReducer from "./slices/adminSlice.jsx";

export const store = configureStore({
  reducer: {
    user: userReducer,
    causes: causeReducer,
    donor: donorReducer,
    admin: adminReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;