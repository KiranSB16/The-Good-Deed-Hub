import express from "express"
import authCltr from "../controllers/forgotPassword-cltr.js"
import { checkSchema } from "express-validator"
import { forgotPasswordValidation, resetPasswordValidation } from "../validators/auth-validation-schema.js"

const router = express.Router()

// Forgot password - request OTP
router.post("/forgot-password", checkSchema(forgotPasswordValidation), authCltr.forgotPassword)

// Reset password - verify OTP & update password
router.post("/reset-password", checkSchema(resetPasswordValidation), authCltr.resetPassword)

export default router
