import Feedback from "../models/feedback-model.js";
import Cause from "../models/cause-model.js";
import User from "../models/user-model.js";
import { validationResult } from "express-validator";

const feedbackCltr = {};

// Donor submits feedback
feedbackCltr.createFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { causeId, message } = req.body;

    // Check if the cause exists
    const cause = await Cause.findById(causeId);
    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }

    // Create feedback
    const feedback = new Feedback({
      donorId: req.user.userId,
      causeId,
      message,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Admin views all feedback
feedbackCltr.listFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("donorId", "name email")
      .populate("causeId", "title description");
    
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedbacks", error: error.message });
  }
};

// Admin requests clarification from fundraiser
feedbackCltr.requestClarification = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.status = "action_required";
    feedback.adminResponse = adminResponse;
    await feedback.save();

    res.status(200).json({ message: "Clarification requested from fundraiser", feedback });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Fundraiser responds to admin's query
feedbackCltr.fundraiserResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { fundraiserResponse } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.status = "reviewed";
    feedback.fundraiserResponse = fundraiserResponse;
    await feedback.save();

    res.status(200).json({ message: "Response submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

export default feedbackCltr;
