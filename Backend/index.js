import dotenv from "dotenv"
dotenv.config()
 
import configureDb from "./config/db.js"
configureDb()
import express from "express"
import cors from 'cors'
import path from "path";
import { fileURLToPath } from "url";

// Required for ES module to resolve `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express()
const port = process.env.PORT

import userRoutes from "./app/routes/userRoutes.js"
import causeRoutes from "./app/routes/causeRoutes.js"
import categoryRoutes from "./app/routes/categoryRoutes.js"
import adminRoutes from "./app/routes/adminRoutes.js"
import fundraiserRoutes from "./app/routes/fundraiserRoutes.js"
import donorRoutes from "./app/routes/donorRoutes.js"
import feedbackRoutes from "./app/routes/feedbackRoutes.js"

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
    

app.use("/api", userRoutes)
app.use("/api" , causeRoutes)
app.use("/api", categoryRoutes)
app.use("/api" , adminRoutes)
app.use("/api",fundraiserRoutes)
app.use("/api", donorRoutes)
app.use("/api", feedbackRoutes)

app.listen(port , () => {
    console.log('Server is connected to port' , port)
})