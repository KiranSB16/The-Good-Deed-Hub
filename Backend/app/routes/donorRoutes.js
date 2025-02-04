import express from "express";
import { AuthenticateUser } from "../middlewares/authentication.js";
import {donorCltr} from "../controllers/donor-cltr.js";
import { checkSchema } from "express-validator";
import { donorValidationSchema } from "../validators/donor-validation-schema.js";
import authorizeUser from "../middlewares/authorization.js";
//import { uploadProfilePic } from "../middlewares/multer.js";

const router = express.Router();

router.post("/donor/profile", AuthenticateUser, authorizeUser(['donor']), checkSchema(donorValidationSchema), donorCltr.createOrUpdateProfile);
router.get("/donor/profile", AuthenticateUser, donorCltr.getProfile);

export default router;
