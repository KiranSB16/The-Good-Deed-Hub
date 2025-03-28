export const donorValidationSchema = {
    mobileNumber: {
        exists: {
            errorMessage: "Mobile number is required",
        },
        notEmpty: {
            errorMessage: "Mobile number cannot be empty",
        },
        isNumeric: {
            errorMessage: "Mobile number should contain only numbers",
        },
        isLength: {
            options: { min: 10, max: 10 },
            errorMessage: "Mobile number should be exactly 10 digits long",
        },
    },
    profileImage: {
        optional: true,
        isArray: {
            errorMessage: "Profile images must be an array",
        },
    },
    totalDonations: {
        optional: true,
        isNumeric: {
            errorMessage: "Total donations must be a number",
        },
    },
    savedCauses: {
        optional: true,
        isArray: {
            errorMessage: "Saved causes should be an array of cause IDs",
        },
    },
};
