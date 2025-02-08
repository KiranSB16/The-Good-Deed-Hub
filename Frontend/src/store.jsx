import {configureStore} from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice.jsx"
const store = configureStore({
    reducer : {
        users : userReducer
    }
})
export default store