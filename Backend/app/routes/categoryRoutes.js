import express from "express"
import categoryCltr from "../controllers/category-cltr.js"
import { checkSchema } from "express-validator"
import { handleValidationErrors } from "../middlewares/validate.js"
import { AuthenticateUser } from "../middlewares/authentication.js"
import authorizeUser from "../middlewares/authorization.js"
import categorySchemaValidation from "../validators/category-validation-schema.js"
const router = express.Router()

router.post("/categories", AuthenticateUser , authorizeUser(['admin']),checkSchema(categorySchemaValidation) , categoryCltr.create)
router.get("/categories", AuthenticateUser , categoryCltr.list )
router.get("/categories/:id" , AuthenticateUser , categoryCltr.show)
router.delete("/categories/:id" , AuthenticateUser , authorizeUser(['admin']),categoryCltr.delete)


export default router