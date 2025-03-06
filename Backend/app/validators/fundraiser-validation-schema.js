export const fundraiserValidationSchema = {
  mobileNumber: {
      in: ['body'],
      exists: {
          errorMessage: "Mobile number is required",
          options: { checkFalsy: true }
      },
      notEmpty: {
          errorMessage: "Mobile number cannot be empty"
      },
      custom: {
          options: (value, { req }) => {
              try {
                  // Handle both string and FormData cases
                  const mobileStr = String(value).trim();
                  if (!/^\d{10}$/.test(mobileStr)) {
                      throw new Error('Mobile number must be exactly 10 digits');
                  }
                  // Store the sanitized value
                  req.body.mobileNumber = mobileStr;
                  return true;
              } catch (error) {
                  throw new Error('Mobile number must be exactly 10 digits');
              }
          }
      }
  },
  profileImage: {
      optional: true,
      custom: {
          options: (value, { req }) => {
              // Skip validation if no file is uploaded
              if (!value) return true;
              
              // Handle file upload from form data
              if (req.files && req.files.profileImage) {
                  return true;
              }
              
              // Handle array of files
              if (Array.isArray(value)) {
                  return true;
              }
              
              // Handle single file object
              if (value && typeof value === 'object') {
                  return true;
              }
              
              return true;
          }
      }
  }
};
