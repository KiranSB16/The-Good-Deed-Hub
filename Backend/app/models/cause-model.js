
import mongoose from "mongoose"
import {Schema , model} from 'mongoose'
const causeSchema = new Schema({
  causeNumber : Number,
  title: String,
  description: String,
  category: String,
  fundraiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  goalAmount: Number,
  currentAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'pending approval'], default: 'pending approval' },
  images: String,
  videos: String,
  shareLink: String,
  qrCode: String,
  startDate: Date ,
  endDate: Date ,
  isApproved : Boolean
}, {timestamps : true});

const Cause = model('Cause', causeSchema);
export default Cause