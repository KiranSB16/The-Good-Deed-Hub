import express from 'express';
import { AuthenticateUser } from '../middlewares/authentication.js';
import paymentController from '../controllers/payment-controller.js';

const router = express.Router();

// Create payment intent
router.post(
    '/create-payment-intent',
    AuthenticateUser,
    paymentController.createPaymentIntent
);

// Handle successful payment
router.post(
    '/payment-success',
    AuthenticateUser,
    paymentController.handlePaymentSuccess
);

// Stripe webhook
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

export default router; 