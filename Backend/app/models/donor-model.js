import mongoose from "mongoose"
import {Schema , model} from "mongoose"
import bcrypt from 'bcryptjs'

const donorSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  mobileNumber: {
    type: String,
    validate: {
      validator: function(v) {
        // Check if the value is empty or matches exactly 10 digits
        return !v || /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits'
    }
  },
  profileImage: {
    type: String
  },
  address: {
    type: String
  },
  bio: {
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