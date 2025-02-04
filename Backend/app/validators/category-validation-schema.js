const categorySchemaValidation = {
    name : {
        exists : {
            errorMessage : "name field is required"
        },
        notEmpty : {
            errorMessage : "name field cannot be empty"
        },
        isLength : {
            options : {min : 3 , max : 50},
            errorMessage : "name field should be minimum of 3 characters and maximum 50 charecters long" 
        },
        trim : true
    }
}
export default categorySchemaValidation