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

// Verify payment status
router.get(
    '/verify/:paymentIntentId',
    AuthenticateUser,
    paymentController.verifyPayment
);

// Get webhook status
router.get(
    '/webhook-status/:paymentIntentId',
    AuthenticateUser,
    paymentController.getWebhookStatus
);

// Create checkout session
router.post('/create-checkout-session', AuthenticateUser, paymentController.createCheckoutSession);

// Verify checkout session - make it public since it's called after Stripe redirect
router.get('/verify-session/:sessionId', paymentController.verifySession);

// Stripe webhook
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

export default router; 