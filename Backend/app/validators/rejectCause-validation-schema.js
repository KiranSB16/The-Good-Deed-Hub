export const rejectCauseValidation = {
    rejectionMessage : {
        exists : {
            errorMessage : "rejection Message is required"
        },
        notEmpty : {
            errorMessage : "rejection message cannot be empty"

        },
        isLength : {
            options:{min : 10},
            errorMessage : "rejection message should be atleast 10 characters long"
        },
        trim : true
    }
}