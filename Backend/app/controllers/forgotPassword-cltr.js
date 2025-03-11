import User from "../models/user-model.js"
import crypto from "crypto"
import { sendPasswordResetOTP } from "../utils/nodemailer.js"
import bcrypt from "bcryptjs"
import { validationResult } from "express-validator"

const authCltr = {};

// Step 1: Generate OTP & Send Email
authCltr.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const otpExpires = Date.now() + 10 * 60 * 1000// OTP expires in 10 minutes

    // Store OTP & expiration in database
    user.resetPasswordOTP = otp
    user.resetPasswordExpires = otpExpires
    await user.save()

    // Send OTP email
    await sendPasswordResetOTP(user.email, otp);

    res.status(200).json({ message: "OTP sent to your email. It expires in 10 minutes." })
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP.", error: error.message })
  }
};

// Step 2: Reset Password
authCltr.resetPassword = async (req, res) => {
  try {
    console.log('Reset password request body:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }

    const { email, otp, newPassword } = req.body
    console.log('Looking up user with email:', email);
    
    const user = await User.findOne({ email })
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    console.log('User OTP fields:', {
      hasOTP: !!user.resetPasswordOTP,
      hasExpiry: !!user.resetPasswordExpires,
      storedOTP: user.resetPasswordOTP,
      providedOTP: otp,
      expiryTime: user.resetPasswordExpires,
      currentTime: Date.now()
    });

    if (!user.resetPasswordOTP || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "No password reset request found. Please request a new OTP." })
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please check and try again." })
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." })
    }

    // Hash new password
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update user password
    user.password = hashedPassword
    user.resetPasswordOTP = null
    user.resetPasswordExpires = null
    await user.save()

    res.status(200).json({ message: "Password reset successful." })
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Failed to reset password.", error: error.message })
  }
}

export default authCltr
