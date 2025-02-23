import Category from "../models/category-model.js"
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
        trim : true,
        custom: {
            options : async(value) => {
                try{
                    const category = await Category.findOne({name : value})
                if(category){
                    throw new Error("category already exists")
                }
                } catch(err){
                    console.log(err)
                    throw new Error(err.message)
                }
                
            }

        }
    }
}
export default categorySchemaValidation