import {Schema , model} from 'mongoose'
const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['donor', 'fundraiser', 'admin']},
  isRestricted: { type: Boolean, default: false },
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
} , {timestamps : true});

const User = model('User', userSchema);
export default User