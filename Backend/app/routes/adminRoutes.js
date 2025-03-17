import express from "express"
import { AuthenticateUser } from "../middlewares/authentication.js"
import authorizeUser from "../middlewares/authorization.js"
import adminCltr from "../controllers/admin-cltr.js"
import { rejectCauseValidation } from "../validators/rejectCause-validation-schema.js"
import { checkSchema } from "express-validator"
import { analyticsValidationSchema } from "../validators/analytics-validation-schema.js"
const router = express.Router()

// Category Management Routes
router.get("/categories", AuthenticateUser, authorizeUser(['admin']), adminCltr.listCategories)
router.post("/categories", AuthenticateUser, authorizeUser(['admin']), adminCltr.createCategory)
router.delete("/categories/:id", AuthenticateUser, authorizeUser(['admin']), adminCltr.deleteCategory)

// Cause Management Routes
router.get("/causes", AuthenticateUser, authorizeUser(['admin']), adminCltr.listCauses)
router.get("/test-causes", AuthenticateUser, authorizeUser(['admin']), adminCltr.testCauses)
router.patch("/causes/approve/:id", AuthenticateUser, authorizeUser(['admin']), adminCltr.approveCause)
router.patch("/causes/reject/:id", AuthenticateUser, authorizeUser(['admin']), checkSchema(rejectCauseValidation), adminCltr.rejectCause)

// Analytics Route
router.get("/analytics", 
    AuthenticateUser, 
    authorizeUser(['admin']), 
    checkSchema(analyticsValidationSchema),
    adminCltr.getAnalytics
);

export default router