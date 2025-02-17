import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice.jsx";
import causeReducer from "./features/causeSlice.jsx";

const store = configureStore({
  reducer: {
    user: userReducer,
    causes: causeReducer,
  }
})

export default store