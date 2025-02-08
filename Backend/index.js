import dotenv from "dotenv"
dotenv.config()
 

import configureDb from "./config/db.js"
configureDb()
import express from "express"
import cors from 'cors'


const app = express()
const port = process.env.PORT

import userRoutes from "./app/routes/userRoutes.js"
import causeRoutes from "./app/routes/causeRoutes.js"
import categoryRoutes from "./app/routes/categoryRoutes.js"
import adminRoutes from "./app/routes/adminRoutes.js"
import fundraiserRoutes from "./app/routes/fundraiserRoutes.js"
import donorRoutes from "./app/routes/donorRoutes.js"
import feedbackRoutes from "./app/routes/feedbackRoutes.js"
import authRoutes from "./app/routes/authRoutes.js";
import reviewRoutes from "./app/routes/reviewRoutes.js"

app.use(express.json())
app.use(cors())
    

app.use("/api", userRoutes)
app.use("/api" , causeRoutes)
app.use("/api", categoryRoutes)
app.use("/api" , adminRoutes)
app.use("/api", fundraiserRoutes)
app.use("/api", donorRoutes)
app.use("/api", feedbackRoutes)
app.use("/api" , authRoutes)
app.use("/api", reviewRoutes)

app.listen(port , () => {
    console.log('Server is connected to port' , port)
})