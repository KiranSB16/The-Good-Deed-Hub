import dotenv from "dotenv";
dotenv.config();

import configureDb from "./config/db.js";
configureDb();
import express from "express";
import cors from 'cors';

const app = express();
const port = process.env.PORT;

import userRoutes from "./app/routes/userRoutes.js";
import causeRoutes from "./app/routes/causeRoutes.js";
import categoryRoutes from "./app/routes/categoryRoutes.js";
import adminRoutes from "./app/routes/adminRoutes.js";
import fundraiserRoutes from "./app/routes/fundraiserRoutes.js";
import donorRoutes from "./app/routes/donorRoutes.js";
import donationRoutes from "./app/routes/donationRoutes.js";
import authRoutes from "./app/routes/authRoutes.js";
import reviewRoutes from "./app/routes/reviewRoutes.js";
import uploadRoutes from "./app/routes/uploadRoutes.js";
import paymentRoutes from './app/routes/paymentRoutes.js';
// Temporarily comment out payment routes
// import paymentRoutes from "./app/routes/paymentRoutes.js";

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature']
}));

// Handle raw body for Stripe webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parse JSON for all other routes
app.use(express.json());

// Create uploads directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
    console.log("In the index")
    mkdirSync('./uploads', { recursive: true });
} catch (err) {
    console.error('Error creating uploads directory:', err);
}

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/causes", causeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fundraiser", fundraiserRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
// Temporarily comment out payment routes
// app.use("/api/payments", paymentRoutes);

app.listen(port, () => {
    console.log("Server running on port", port);
});