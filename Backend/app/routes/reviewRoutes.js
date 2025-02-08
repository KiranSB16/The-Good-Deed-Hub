import express from "express";
import { AuthenticateUser } from "../middlewares/authentication.js";
import reviewCltr from "../controllers/review-cltr.js";
import { checkSchema } from "express-validator";
import { reviewValidationSchema } from "../validators/review-validation-schema.js";

const router = express.Router();

// Submit a review
router.post("/reviews", AuthenticateUser, checkSchema(reviewValidationSchema), reviewCltr.create);

// Get all reviews for a specific user
router.get("/reviews/:id", AuthenticateUser, reviewCltr.getReviews);

// Get top donors based on reviews
router.get("/top-donors", reviewCltr.getTopDonors);

export default router;
