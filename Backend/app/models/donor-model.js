import mongoose from "mongoose"
import {Schema , model} from "mongoose"
import bcrypt from 'bcryptjs'

const donorSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  mobile: {
    type: String,
    match: [/^\d{10}$/, 'Mobile number must be 10 digits']
  },
  profileImage: {
    type: String
  },
  savedCauses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cause'
  }],
  role: {
    type: String,
    default: 'donor'
  }
}, {
  timestamps: true
})

// Hash password before saving
donorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
donorSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const Donor = model("Donor" , donorSchema)
export default Donor