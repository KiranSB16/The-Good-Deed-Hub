export const analyticsValidationSchema = {
    // No validation needed for GET request parameters
    // The validation will be done on the response data
};

// Response validation schema
export const analyticsResponseSchema = {
    users: {
        exists: { errorMessage: "Users data is required" },
        notEmpty: { errorMessage: "Users data cannot be empty" },
        isObject: { errorMessage: "Users must be an object" },
        custom: {
            options: (value) => {
                if (!value.total || !value.donors || !value.fundraisers) {
                    throw new Error("Users object must contain total, donors, and fundraisers");
                }
                return true;
            }
        }
    },
    causes: {
        exists: { errorMessage: "Causes data is required" },
        notEmpty: { errorMessage: "Causes data cannot be empty" },
        isObject: { errorMessage: "Causes must be an object" },
        custom: {
            options: (value) => {
                if (!value.total || !value.active || !value.completed || !value.pending) {
                    throw new Error("Causes object must contain total, active, completed, and pending");
                }
                return true;
            }
        }
    },
    donations: {
        exists: { errorMessage: "Donations data is required" },
        notEmpty: { errorMessage: "Donations data cannot be empty" },
        isObject: { errorMessage: "Donations must be an object" },
        custom: {
            options: (value) => {
                if (!value.total || !value.amount) {
                    throw new Error("Donations object must contain total and amount");
                }
                return true;
            }
        }
    },
    categoryDistribution: {
        exists: { errorMessage: "Category distribution is required" },
        notEmpty: { errorMessage: "Category distribution cannot be empty" },
        isArray: { errorMessage: "Category distribution must be an array" },
        custom: {
            options: (value) => {
                if (!value.every(item => item.name && typeof item.count === 'number')) {
                    throw new Error("Each category must have a name and count");
                }
                return true;
            }
        }
    },
    monthlyDonations: {
        exists: { errorMessage: "Monthly donations data is required" },
        notEmpty: { errorMessage: "Monthly donations data cannot be empty" },
        isArray: { errorMessage: "Monthly donations must be an array" },
        custom: {
            options: (value) => {
                if (!value.every(item => 
                    item._id && 
                    item._id.year && 
                    item._id.month && 
                    typeof item.count === 'number' && 
                    typeof item.totalAmount === 'number'
                )) {
                    throw new Error("Each monthly donation must have year, month, count, and totalAmount");
                }
                return true;
            }
        }
    }
}; 