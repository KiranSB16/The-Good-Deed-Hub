export const handleValidationErrors = (schema) => {
  return async (req, res, next) => {
      try {
          // Validate the request body against the schema
          const validatedValue = await schema.validateAsync(req.body, { abortEarly: false });
          req.body = validatedValue; // Update the request body with validated data
         
          next(); // Proceed to the next middleware/route handler
      } catch (error) {
          console.error("Validation Error:", error);

          if (error.details && Array.isArray(error.details)) {
              // Extract detailed error messages
              const errorMessages = error.details.map(err => err.message).join(', ');
              return res.status(400).json({ errors: errorMessages });
          }
          // Fallback for unexpected validation errors
          return res.status(400).json({ errors: error.message || "Invalid input provided." });
      }
  };
};