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
        min: 1
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: { 
        type: String 
    },
    paymentMethod: { 
        type: String 
    },
    message: { 
        type: String,
        maxLength: 500 
    }
}, {
    timestamps: true
})

const Donation = model("Donation", donationSchema)
export default Donation
