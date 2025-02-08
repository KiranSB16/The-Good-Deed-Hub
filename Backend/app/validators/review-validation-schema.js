export const reviewValidationSchema = {
    rating: {
      exists: { errorMessage: "Rating is required" },
      isInt: { options: { min: 1, max: 5 }, errorMessage: "Rating must be between 1 and 5" },
    },
    comment: {
      optional: true,
      isLength: { options: { min: 10 }, errorMessage: "Comment should be at least 10 characters long" },
      trim: true,
    },
  };
  