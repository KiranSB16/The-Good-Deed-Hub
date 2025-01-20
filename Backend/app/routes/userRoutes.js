import express from "express"
import { checkSchema } from "express-validator"
import { userLoginSchema, userRegisterSchema } from "../validators/user-validation-schema.js"
import userCltr from "../controllers/user-cltr.js"
import {AuthenticateUser} from "../middlewares/authentication.js"
const router = express.Router()

router.post("/users/register" , checkSchema(userRegisterSchema), userCltr.register)
router.post("/users/login", checkSchema(userLoginSchema) , userCltr.login)
router.get("/users/profile" , AuthenticateUser , userCltr.profile )

export default router