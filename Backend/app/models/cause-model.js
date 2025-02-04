
import mongoose from "mongoose"
import {Schema , model} from 'mongoose'
const causeSchema = new Schema({
  title: String,
  description: String,
  category: {type : mongoose.Schema.Types.ObjectId , ref : 'Category'},
  fundraiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  goalAmount: Number,
  currentAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['approved', 'rejected', 'pending approval'], default: 'pending approval' },
  rejectionMessage: { type: String, default: null },
  images: [String],
  pdfDocument : [String],
  shareLink: String,
  qrCode: String,
  startDate: Date ,
  endDate: Date ,
  isApproved : Boolean
}, {timestamps : true});

const Cause = model('Cause', causeSchema);
export default Cause