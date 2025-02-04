import express from "express"
import { AuthenticateUser } from "../middlewares/authentication.js"
import authorizeUser from "../middlewares/authorization.js"
import adminCltr from "../controllers/admin-cltr.js"
import { rejectCauseValidation } from "../validators/rejectCause-validation-schema.js"
import { checkSchema } from "express-validator"
const router = express.Router()

router.patch("/causes/approve/:id" , AuthenticateUser , authorizeUser(['admin']) , adminCltr.approveCause)
router.patch("/causes/reject/:id" , AuthenticateUser , authorizeUser(['admin']) , checkSchema(rejectCauseValidation) ,adminCltr.rejectCause)

export default router