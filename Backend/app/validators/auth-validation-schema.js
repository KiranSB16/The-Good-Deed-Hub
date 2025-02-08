export const forgotPasswordValidation = {
    email: {
      exists: { errorMessage: "Email is required." },
      notEmpty: { errorMessage: "Email cannot be empty." },
      isEmail: { errorMessage: "Invalid email format." },
      trim: true,
      normalizeEmail: true,
    },
  };
  
  export const resetPasswordValidation = {
    email: {
      exists: { errorMessage: "Email is required." },
      notEmpty: { errorMessage: "Email cannot be empty." },
      isEmail: { errorMessage: "Invalid email format." },
      trim: true,
      normalizeEmail: true,
    },
    otp: {
      exists: { errorMessage: "OTP is required." },
      notEmpty: { errorMessage: "OTP cannot be empty." },
      isLength: { options: { min: 6, max: 6 }, errorMessage: "OTP must be 6 digits." },
    },
    newPassword: {
      exists: { errorMessage: "New password is required." },
      notEmpty: { errorMessage: "New password cannot be empty." },
      isStrongPassword: {
        options: { minLength: 8, minLowercase: 1, minUppercase: 1, minNumber: 1, minSymbols: 1 },
        errorMessage: "Password must be at least 8 characters long, with 1 uppercase, 1 lowercase, 1 number, and 1 symbol.",
      },
    },
  };
  