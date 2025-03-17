import mongoose from "mongoose"
import { Schema, model } from "mongoose"

const donationSchema = new Schema({
    donorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Donor',
        required: true 
    },
    causeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cause', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true,
        min: 0
    },
    platformFee: {
        type: Number,
        required: true,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    message: { 
        type: String,
        trim: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: { 
        type: String,
        index: true
    },
    paymentMethod: { 
        type: String,
        required: true,
        enum: ['stripe', 'other']
    }
}, {
    timestamps: true
})

donationSchema.index({ donorId: 1, causeId: 1 });

const Donation = model("Donation", donationSchema)
export default Donation
