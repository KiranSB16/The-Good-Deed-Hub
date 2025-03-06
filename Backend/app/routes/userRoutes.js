import express from "express"
import { checkSchema } from "express-validator"
import { userLoginSchema, userRegisterSchema } from "../validators/user-validation-schema.js"
import userCltr from "../controllers/user-cltr.js"
import {AuthenticateUser} from "../middlewares/authentication.js"
const router = express.Router()

router.post("/register" , checkSchema(userRegisterSchema), userCltr.register)
router.post("/login", checkSchema(userLoginSchema) , userCltr.login)
router.get("/profile" , AuthenticateUser , userCltr.profile )
router.get("/" , AuthenticateUser , userCltr.all)

// Add route for toggling user access
router.patch("/:id/access", AuthenticateUser, userCltr.toggleUserAccess)

export default router