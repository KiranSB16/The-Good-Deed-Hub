import stripe from '../config/stripe.js';
import Donation from '../models/donation-model.js';
import Cause from '../models/cause-model.js';
import Donor from '../models/donor-model.js';
import mongoose from 'mongoose';

const paymentController = {};

// Create a payment intent
paymentController.createPaymentIntent = async (req, res) => {
    try {
        const { amount, causeId, isAnonymous } = req.body;

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

        // Calculate platform fee (5%)
        const platformFee = Math.round(amount * 0.05);
        const actualDonationAmount = amount - platformFee;  // Deduct platform fee from donation amount

        // Create payment intent (amount in paise)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to paise (original amount)
            currency: 'inr',
            metadata: {
                causeId: causeId.toString(),
                donorId: req.user._id.toString(),
                actualDonationAmount: actualDonationAmount.toString(),
                platformFee: platformFee.toString(),
                isAnonymous: (isAnonymous || false).toString()
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            platformFee,
            actualDonationAmount,
            totalAmount: amount
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ message: 'Error creating payment intent' });
    }
};

// Handle successful payment
paymentController.handlePaymentSuccess = async (req, res) => {
    try {
        const { paymentIntentId, causeId, message, isAnonymous } = req.body;

        // Verify the payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment not successful' });
        }

        // Get the amounts from metadata
        const actualDonationAmount = parseInt(paymentIntent.metadata.actualDonationAmount);
        const platformFee = parseInt(paymentIntent.metadata.platformFee);
        const totalAmount = actualDonationAmount + platformFee;

        // Find existing donation or create new one
        let donation = await Donation.findOne({ transactionId: paymentIntentId });
        
        if (!donation) {
            donation = new Donation({
                donorId: req.user._id,
                causeId,
                amount: actualDonationAmount,
                platformFee,
                totalAmount,
                message,
                isAnonymous: isAnonymous || false,
                status: 'pending', // Will be updated to 'completed' by webhook
                transactionId: paymentIntentId,
                paymentMethod: 'stripe'
            });
            await donation.save();
        } else {
            // Update existing donation
            donation.message = message;
            donation.isAnonymous = isAnonymous || false;
            await donation.save();
        }

        // Populate the donation with cause and donor details
        await donation.populate(['causeId', 'donorId']);

        res.json({
            message: 'Payment successful',
            donation
        });
    } catch (error) {
        console.error('Payment success handling error:', error);
        res.status(500).json({ message: 'Error processing payment confirmation' });
    }
};

// Create a checkout session
paymentController.createCheckoutSession = async (req, res) => {
    try {
        const { amount, causeId, isAnonymous } = req.body;

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

        // Calculate platform fee (5%)
        const platformFee = Math.round(amount * 0.05);
        const actualDonationAmount = amount - platformFee;

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Donation to ${cause.title}`,
                            description: `Your contribution: ₹${actualDonationAmount} (Platform fee: ₹${platformFee})`,
                        },
                        unit_amount: Math.round(amount * 100), // Convert to paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
            metadata: {
                causeId: causeId.toString(),
                donorId: req.user._id.toString(),
                actualDonationAmount: actualDonationAmount.toString(),
                platformFee: platformFee.toString(),
                isAnonymous: (isAnonymous || false).toString()
            },
            payment_intent_data: {
                metadata: {
                    causeId: causeId.toString(),
                    donorId: req.user._id.toString(),
                    actualDonationAmount: actualDonationAmount.toString(),
                    platformFee: platformFee.toString(),
                    isAnonymous: (isAnonymous || false).toString()
                }
            }
        });

        res.json({ 
            sessionId: session.id,
            url: session.url 
        });
    } catch (error) {
        console.error('Checkout session creation error:', error);
        res.status(500).json({ message: 'Error creating checkout session' });
    }
};

// Webhook handler for Stripe events
paymentController.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        console.log('🎯 Webhook received:', event.type);

        // Handle the event
        switch (event.type) {
            case 'payment_intent.created':
                const paymentIntent = event.data.object;
                console.log('💫 PaymentIntent created:', paymentIntent.id);
                
                try {
                    // Create a pending donation record if it doesn't exist
                    const existingDonation = await Donation.findOne({ transactionId: paymentIntent.id });
                    if (!existingDonation) {
                        const donation = new Donation({
                            donorId: paymentIntent.metadata.donorId,
                            causeId: paymentIntent.metadata.causeId,
                            amount: parseInt(paymentIntent.metadata.actualDonationAmount),
                            platformFee: parseInt(paymentIntent.metadata.platformFee),
                            totalAmount: paymentIntent.amount / 100,
                            status: 'pending',
                            transactionId: paymentIntent.id,
                            paymentMethod: 'stripe',
                            isAnonymous: paymentIntent.metadata.isAnonymous === 'true'
                        });
                        await donation.save();
                        console.log('✅ Created pending donation:', donation._id);
                    }
                } catch (err) {
                    console.error('❌ Error creating pending donation:', err);
                    throw err; // Rethrow to trigger webhook retry
                }
                break;

            case 'payment_intent.succeeded':
                const succeededIntent = event.data.object;
                console.log('💰 PaymentIntent succeeded:', succeededIntent.id);
                
                try {
                    // Use a session to ensure atomic updates
                    const session = await mongoose.startSession();
                    await session.withTransaction(async () => {
                        // Get the donation details from metadata
                        const actualDonationAmount = parseInt(succeededIntent.metadata.actualDonationAmount);
                        const platformFee = parseInt(succeededIntent.metadata.platformFee);
                        const causeId = succeededIntent.metadata.causeId;
                        const donorId = succeededIntent.metadata.donorId;
                        const isAnonymous = succeededIntent.metadata.isAnonymous === 'true';
                        const message = succeededIntent.metadata.message;

                        // Find existing donation or create new one
                        let donation = await Donation.findOne({ transactionId: succeededIntent.id });
                        
                        if (donation) {
                            // Update existing donation if status is not already completed
                            if (donation.status !== 'completed') {
                                donation.status = 'completed';
                                donation.amount = actualDonationAmount;
                                donation.platformFee = platformFee;
                                await donation.save({ session });

                                // Update cause's current amount
                                const updatedCause = await Cause.findByIdAndUpdate(
                                    causeId,
                                    { 
                                        $inc: { 
                                            currentAmount: actualDonationAmount
                                        } 
                                    },
                                    { new: true, session }
                                );

                                if (!updatedCause) {
                                    throw new Error('Cause not found');
                                }

                                console.log('✅ Cause amount updated:', {
                                    causeId: updatedCause._id,
                                    previousAmount: updatedCause.currentAmount - actualDonationAmount,
                                    donationAmount: actualDonationAmount,
                                    newAmount: updatedCause.currentAmount
                                });

                                // Update donor's total donations
                                const updatedDonor = await Donor.findByIdAndUpdate(
                                    donorId,
                                    { $inc: { totalDonations: actualDonationAmount } },
                                    { new: true, session }
                                );

                                if (!updatedDonor) {
                                    throw new Error('Donor not found');
                                }
                            }
                        } else {
                            // Create new donation record
                            donation = new Donation({
                                donorId,
                                causeId,
                                amount: actualDonationAmount,
                                platformFee,
                                totalAmount: succeededIntent.amount / 100,
                                status: 'completed',
                                transactionId: succeededIntent.id,
                                paymentMethod: 'stripe',
                                isAnonymous,
                                message
                            });

                            await donation.save({ session });

                            // Update cause's current amount
                            const updatedCause = await Cause.findByIdAndUpdate(
                                causeId,
                                { 
                                    $inc: { 
                                        currentAmount: actualDonationAmount
                                    } 
                                },
                                { new: true, session }
                            );

                            if (!updatedCause) {
                                throw new Error('Cause not found');
                            }

                            console.log('✅ Cause amount updated:', {
                                causeId: updatedCause._id,
                                previousAmount: updatedCause.currentAmount - actualDonationAmount,
                                donationAmount: actualDonationAmount,
                                newAmount: updatedCause.currentAmount
                            });

                            // Update donor's total donations
                            const updatedDonor = await Donor.findByIdAndUpdate(
                                donorId,
                                { $inc: { totalDonations: actualDonationAmount } },
                                { new: true, session }
                            );

                            if (!updatedDonor) {
                                throw new Error('Donor not found');
                            }
                        }

                        console.log('✅ Payment completed successfully:', {
                            donationId: donation._id,
                            causeId,
                            donorId,
                            amount: actualDonationAmount,
                            status: donation.status
                        });
                    });
                    await session.endSession();
                } catch (err) {
                    console.error('❌ Error processing successful payment:', err);
                    throw err; // Rethrow to trigger webhook retry
                }
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                console.log('❌ Payment failed:', failedIntent.id);
                
                try {
                    const donation = await Donation.findOneAndUpdate(
                        { transactionId: failedIntent.id },
                        { status: 'failed' },
                        { new: true }
                    );
                    
                    if (donation) {
                        console.log('✅ Updated donation status to failed:', donation._id);
                    }
                } catch (err) {
                    console.error('❌ Error handling failed payment:', err);
                    throw err; // Rethrow to trigger webhook retry
                }
                break;

            case 'charge.succeeded':
                const charge = event.data.object;
                console.log('💳 Charge succeeded:', charge.id);
                break;

            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('💫 Checkout session completed:', session.id);
                
                try {
                    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                    const metadata = session.metadata;

                    // Start a mongoose session for atomic operations
                    const dbSession = await mongoose.startSession();
                    await dbSession.withTransaction(async () => {
                        // Create donation record
                        const donation = new Donation({
                            donorId: metadata.donorId,
                            causeId: metadata.causeId,
                            amount: parseInt(metadata.actualDonationAmount),
                            platformFee: parseInt(metadata.platformFee),
                            totalAmount: session.amount_total / 100,
                            status: 'completed',
                            transactionId: session.payment_intent,
                            paymentMethod: 'stripe',
                            isAnonymous: metadata.isAnonymous === 'true',
                            message: metadata.message
                        });
                        await donation.save({ session: dbSession });

                        // Then update the cause's current amount
                        await Cause.findByIdAndUpdate(
                            metadata.causeId,
                            { $inc: { currentAmount: parseInt(metadata.actualDonationAmount) } },
                            { session: dbSession }
                        );

                        // Update donor's total donations
                        await Donor.findByIdAndUpdate(
                            metadata.donorId,
                            { $inc: { totalDonations: parseInt(metadata.actualDonationAmount) } },
                            { session: dbSession }
                        );

                        console.log('✅ Donation completed successfully:', {
                            donationId: donation._id,
                            sessionId: session.id,
                            amount: metadata.actualDonationAmount
                        });
                    });
                    await dbSession.endSession();
                } catch (err) {
                    console.error('❌ Error processing checkout session:', err);
                    throw err;
                }
                break;

            case 'checkout.session.expired':
                console.log('❌ Checkout session expired:', event.data.object.id);
                break;

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        res.json({ 
            received: true,
            type: event.type,
            id: event.id
        });
    } catch (err) {
        console.error('❌ Webhook error:', err.message);
        res.status(400).json({ 
            error: `Webhook Error: ${err.message}`,
            type: event?.type,
            id: event?.id
        });
    }
};

// Add a payment verification endpoint
paymentController.verifyPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.params;
        
        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                error: 'Payment Intent ID is required'
            });
        }

        // Verify the payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Check if payment was successful
        const success = paymentIntent.status === 'succeeded';
        
        // Get the donation details
        const donation = await Donation.findOne({ transactionId: paymentIntentId })
            .populate('causeId')
            .populate('donorId');

        if (!donation) {
            return res.status(404).json({
                success: false,
                error: 'Donation record not found'
            });
        }

        res.json({
            success,
            payment: {
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
            },
            donation: {
                id: donation._id,
                amount: donation.amount,
                status: donation.status,
                isAnonymous: donation.isAnonymous,
                cause: donation.causeId,
                platformFee: donation.platformFee,
                totalAmount: donation.totalAmount,
                createdAt: donation.createdAt
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to verify payment'
        });
    }
};

// Get webhook status
paymentController.getWebhookStatus = async (req, res) => {
    try {
        const { paymentIntentId } = req.params;
        
        if (!paymentIntentId) {
            return res.status(400).json({
                status: 'error',
                error: 'Payment Intent ID is required'
            });
        }

        // Check donation status
        const donation = await Donation.findOne({ transactionId: paymentIntentId });
        
        if (!donation) {
            return res.status(404).json({
                status: 'error',
                error: 'Donation not found'
            });
        }

        // Return webhook status based on donation status
        res.json({
            status: donation.status === 'completed' ? 'completed' : 'pending',
            donation: {
                id: donation._id,
                status: donation.status,
                amount: donation.amount,
                platformFee: donation.platformFee,
                totalAmount: donation.totalAmount
            }
        });
    } catch (error) {
        console.error('Error checking webhook status:', error);
        res.status(500).json({
            status: 'error',
            error: error.message || 'Failed to check webhook status'
        });
    }
};

// Verify checkout session
paymentController.verifySession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('🔍 Verifying session:', sessionId);

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID is required'
            });
        }

        // Retrieve the session
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });
        console.log('💫 Session status:', session.payment_status);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                error: 'Payment not completed'
            });
        }

        // Find the donation with populated cause details
        let donation = await Donation.findOne({ 
            transactionId: session.payment_intent.id 
        }).populate([
            {
                path: 'causeId',
                select: 'title description currentAmount goalAmount'
            },
            {
                path: 'donorId',
                select: 'name email'
            }
        ]);

        if (!donation) {
            console.log('⏳ Donation not found, creating from session data...');
            
            try {
                const metadata = session.metadata;
                if (!metadata) {
                    throw new Error('Session metadata is missing');
                }

                const actualDonationAmount = parseInt(metadata.actualDonationAmount);
                if (isNaN(actualDonationAmount)) {
                    throw new Error('Invalid donation amount');
                }
                
                // Find or create donor
                let donor = await Donor.findOne({ userId: metadata.donorId });
                if (!donor) {
                    donor = new Donor({
                        userId: metadata.donorId,
                        savedCauses: []
                    });
                    await donor.save();
                }
                
                // Create the donation
                donation = new Donation({
                    donorId: donor._id,
                    causeId: metadata.causeId,
                    amount: actualDonationAmount,
                    platformFee: parseInt(metadata.platformFee),
                    totalAmount: session.amount_total / 100,
                    status: 'completed',
                    transactionId: session.payment_intent.id,
                    paymentMethod: 'stripe',
                    isAnonymous: metadata.isAnonymous === 'true',
                    message: metadata.message
                });
                await donation.save();

                // Update cause's current amount
                const updatedCause = await Cause.findByIdAndUpdate(
                    metadata.causeId,
                    { $inc: { currentAmount: actualDonationAmount } },
                    { new: true }
                );

                if (!updatedCause) {
                    throw new Error('Cause not found');
                }

                console.log('✅ Cause amount updated:', {
                    causeId: updatedCause._id,
                    previousAmount: updatedCause.currentAmount - actualDonationAmount,
                    donationAmount: actualDonationAmount,
                    newAmount: updatedCause.currentAmount
                });

                // Update donor's total donations
                const updatedDonor = await Donor.findByIdAndUpdate(
                    donor._id,
                    { $inc: { totalDonations: actualDonationAmount } },
                    { new: true }
                );

                if (!updatedDonor) {
                    throw new Error('Donor not found');
                }

                // Get the latest cause data
                const latestCause = await Cause.findById(metadata.causeId)
                    .select('title description currentAmount goalAmount');

                // Populate the donation after creation with the latest cause data
                donation = await Donation.findById(donation._id)
                    .populate([
                        {
                            path: 'causeId',
                            select: 'title description currentAmount goalAmount'
                        },
                        {
                            path: 'donorId',
                            select: 'name email'
                        }
                    ]);

                if (latestCause) {
                    donation = donation.toObject();
                    donation.causeId = latestCause;
                }

                console.log('✅ Donation created successfully:', donation._id);
            } catch (error) {
                console.error('Error creating donation:', error);
                throw error;
            }
        } else {
            // If donation exists, get the latest cause data
            const updatedCause = await Cause.findById(donation.causeId._id)
                .select('title description currentAmount goalAmount');
            
            if (updatedCause) {
                donation = donation.toObject();
                donation.causeId = updatedCause;
            }
        }

        console.log('✅ Sending donation data:', {
            donationId: donation._id,
            causeId: donation.causeId._id,
            currentAmount: donation.causeId.currentAmount,
            goalAmount: donation.causeId.goalAmount
        });

        res.json({
            success: true,
            donation
        });
    } catch (error) {
        console.error('❌ Session verification error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to verify session'
        });
    }
};

export default paymentController; 