import {createSlice , createAsyncThunk} from "@reduxjs/toolkit"
import axios from "../config/axios.jsx"
export const registerUser = createAsyncThunk("users/registerUser",async({formData , resetForm} , {rejectWithValue}) => {
    try{
        const response = await axios.post("/api/users/register" , formData)
        console.log(response.data)
        resetForm()
        return response.data
    } catch(err){
        console.log(err)
        rejectWithValue(err.response.data)
    } 
})

export const loginUser = createAsyncThunk("users/loginUser", async({formData , resetform}, {rejectWithValue}) => {
    try{
        const response = await axios.post("/api/users/login", formData , {headers : {Authorization : localStorage.getItem('token')}})
        console.log(response.data)
        //resetform()
        localStorage.setItem("authToken", response.data.token);
        return response.data

    }catch(err){
        console.log(err)
        rejectWithValue(err.response.data.errors)
    }
})

// export const fetchAllUsers = createAsyncThunk("users/fetchAllUsers", async() => {
//     try{
//         const response = await axios.get("/api/users" ) //{headers : {Authorization : localStorage.getItem('token')}})
//         console.log(response.data)
//         return response.data

//     } catch(err){
//         console.log(err)
//     }
// })
const userSlice = createSlice({
    name : "users",
    initialState : {isLoggedIn : false , data : [] , serverErrors:[]},
    extraReducers : (builder) => {
        builder.addCase(registerUser.fulfilled , (state , action) => {
            state.data.push(action.payload)
        })
        builder.addCase(registerUser.rejected , (state , action) => {
            state.serverErrors = action.payload
        })
        // builder.addCase(fetchAllUsers.fulfilled , (state , action) => {
        //     state.data = action.payload
        // });

        builder.addCase(loginUser.fulfilled , (state , action) => {
            state.isLoggedIn = true
            state.data.push(action.payload)
        })
        builder.addCase(loginUser.rejected , (state , action) => {
            state.serverErrors = action.payload
        })
    }
})

export default userSlice.reducer