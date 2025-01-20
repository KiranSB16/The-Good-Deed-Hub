import dotenv from "dotenv"
import express from "express"
import cors from 'cors'

import configureDb from "./config/db.js"

import userRoutes from "./app/routes/userRoutes.js"
import causeRoutes from "./app/routes/causeRoutes.js"

dotenv.config()
configureDb()

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cors())

app.use("/api", userRoutes)
app.use("/api" , causeRoutes)

app.listen(port , () => {
    console.log('Server is connected to port' , port)
})