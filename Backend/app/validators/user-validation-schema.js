import User from "../models/user-model.js"
export const userRegisterSchema = {
    name : {
        exists : {
            errorMessage : "name field is required"
        },
        notEmpty : {
            errorMessage : "name field cannot be empty"
        },
        isLength : ({
            min : 3,
            max : 50,
            errorMessage : "name should be minimum 3 characters and mx 50 charecters long"
        }),
        trim : true
    },
    email:{
        exists :{
            errorMessage:"email field is required"
        },
        notEmpty : {
            errorMessage:"email field cannot be empty"
        },
        isEmail : {
            errorMessage : "email should be in valid format"
        },
        trim:true,
        normalizeEmail : true,
        custom:{
            options: async(value) => {
                try{
                    const user = await User.findOne({email:value})
                    if(user){
                        throw new Error("email already exists")
                    }
                }catch(err){
                    throw new Error(err.message)
                }
                return true
            }
        }

    }, 
    password : {
        exists : {
            errorMessage : "password field is required"
        },
        notEmpty:{
            errorMessage: "password field cannot be empty"
        },
        isStrongPassword : {
            options : {
                minLength : 1,
                minLowercase : 1,
                minUppercase : 1,
                minSymbol:1,
                minNumber:1
            },
            errorMessage : "password must have minimum of 1 lowercase , 1 uppercase , 1 number ,1 symbol "

        }
    },
    role: {
        exists: {
          errorMessage: "Role field is required",
        },
        notEmpty: {
          errorMessage: "Role field cannot be empty",
        },
        isIn: {
          options: [["donor", "fundraiser", "admin"]],
          errorMessage: "Role must be one of: donor, fundraiser, or admin",
        },
        trim: true,
      },
    
}
export const userLoginSchema = {
    email:{
        exists :{
            errorMessage:"email field is required"
        },
        notEmpty : {
            errorMessage:"email field cannot be empty"
        },
        isEmail : {
            errorMessage : "email should be in valid format"
        },
        trim:true,
        normalizeEmail : true,
    },

    password : {
        exists : {
            errorMessage : "password field is required"
        },
        notEmpty:{
            errorMessage: "password field cannot be empty"
        },
        isStrongPassword : {
            options : {
                minLength : 1,
                minLowercase : 1,
                minUppercase : 1,
                minSymbol:1,
                minNumber:1
            },
            errorMessage : "password must have minimum of 1 lowercase , 1 uppercase , 1 number ,1 symbol "
        }
    }

}
