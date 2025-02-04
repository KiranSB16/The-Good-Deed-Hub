export const feedbackValidation = {
  message: {
    exists: { errorMessage: "Feedback message is required" },
    notEmpty: { errorMessage: "Feedback message cannot be empty" },
    isLength: {
      options: { min: 10 },
      errorMessage: "Feedback message should be at least 10 characters long",
    },
    trim: true,
  },
  causeId: {
    exists: { errorMessage: "Cause ID is required" },
    notEmpty: { errorMessage: "Cause ID cannot be empty" },
    isMongoId: { errorMessage: "Invalid cause ID" },
  },
};
