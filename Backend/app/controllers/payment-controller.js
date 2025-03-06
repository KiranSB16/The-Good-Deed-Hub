import stripe from '../config/stripe.js';
import Donation from '../models/donation-model.js';
import Cause from '../models/cause-model.js';
import Donor from '../models/donor-model.js';

const paymentController = {};

// Create a payment intent
paymentController.createPaymentIntent = async (req, res) => {
    try {
        const { amount, causeId } = req.body;

        // Validate amount (minimum 100 INR)
        if (!amount || amount < 100) {
            return res.status(400).json({ message: 'Minimum donation amount is ₹100' });
        }

        // Verify cause exists and is active
        const cause = await Cause.findById(causeId);
        if (!cause) {
            return res.status(404).json({ message: 'Cause not found' });
        }

        if (cause.status !== 'approved') {
            return res.status(400).json({ message: 'Cannot donate to unapproved cause' });
        }

        // Create payment intent (amount in paise)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'inr',
            metadata: {
                causeId: causeId.toString(),
                donorId: req.user._id.toString()
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ message: 'Error creating payment intent' });
    }
};

// Handle successful payment
paymentController.handlePaymentSuccess = async (req, res) => {
    try {
        const { paymentIntentId, causeId, amount, message } = req.body;

        // Verify the payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment not successful' });
        }

        // Create donation record
        const donation = new Donation({
            donorId: req.user._id,
            causeId,
            amount,
            message,
            status: 'completed',
            transactionId: paymentIntentId,
            paymentMethod: 'stripe'
        });

        await donation.save();

        // Update cause's raised amount
        await Cause.findByIdAndUpdate(causeId, {
            $inc: { raisedAmount: amount }
        });

        // Update donor's total donations
        await Donor.findOneAndUpdate(
            { userId: req.user._id },
            { $inc: { totalDonations: amount } }
        );

        res.json({
            message: 'Payment successful',
            donation
        });
    } catch (error) {
        console.error('Payment success handling error:', error);
        res.status(500).json({ message: 'Error processing payment confirmation' });
    }
};

// Webhook handler for Stripe events
paymentController.handleWebhook = async (req, res) => {
    try {
        const payload = req.body;
        
        // Handle the event
        switch (payload.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = payload.data.object;
                console.log('PaymentIntent succeeded:', paymentIntent.id);
                
                // Update donation status if needed
                await Donation.findOneAndUpdate(
                    { transactionId: paymentIntent.id },
                    { status: 'completed' }
                );
                break;
                
            case 'payment_intent.payment_failed':
                const failedPayment = payload.data.object;
                console.log('Payment failed:', failedPayment.id);
                
                // Update donation status if needed
                await Donation.findOneAndUpdate(
                    { transactionId: failedPayment.id },
                    { status: 'failed' }
                );
                break;
                
            default:
                console.log(`Unhandled event type ${payload.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

export default paymentController; 