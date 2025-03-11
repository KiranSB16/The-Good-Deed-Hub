import express from "express"
import { checkSchema } from "express-validator"
import { userLoginSchema, userRegisterSchema } from "../validators/user-validation-schema.js"
import userCltr from "../controllers/user-cltr.js"
import {AuthenticateUser} from "../middlewares/authentication.js"
import multer from "multer"
import upload from "../middlewares/multer.js"

const router = express.Router()

router.post("/register" , checkSchema(userRegisterSchema), userCltr.register)
router.post("/login", checkSchema(userLoginSchema) , userCltr.login)
router.get("/profile" , AuthenticateUser , userCltr.profile)
router.put("/profile", AuthenticateUser, upload.single('profileImage'), userCltr.updateProfile)
router.get("/" , AuthenticateUser , userCltr.all)

// Add route for toggling user access
router.patch("/:id/access", AuthenticateUser, userCltr.toggleUserAccess)

export default router