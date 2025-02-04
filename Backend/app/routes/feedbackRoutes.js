import express from "express";
import { AuthenticateUser } from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import feedbackCltr from "../controllers/feedback-cltr.js";
import { checkSchema } from "express-validator";
import { feedbackValidation } from "../validators/feedback-validation-schema.js";

const router = express.Router();

// Donor submits feedback
router.post(
  "/feedback",
  AuthenticateUser,
  authorizeUser(["donor"]),
  checkSchema(feedbackValidation),
  feedbackCltr.createFeedback
);

// Admin views all feedback
router.get(
  "/feedback",
  AuthenticateUser,
  authorizeUser(["admin"]),
  feedbackCltr.listFeedbacks
);

// Admin requests clarification from fundraiser
router.patch(
  "/feedback/request-clarification/:id",
  AuthenticateUser,
  authorizeUser(["admin"]),
  feedbackCltr.requestClarification
);

// Fundraiser responds to admin
router.patch(
  "/feedback/respond/:id",
  AuthenticateUser,
  authorizeUser(["fundraiser"]),
  feedbackCltr.fundraiserResponse
);

export default router;
