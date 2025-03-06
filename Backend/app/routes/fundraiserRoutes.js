import express from "express";
import { AuthenticateUser } from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import {fundraiserCltr} from "../controllers/fundraiser-cltr.js";
import { checkSchema } from "express-validator";
import { fundraiserValidationSchema } from "../validators/fundraiser-validation-schema.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Get fundraiser profile
router.get("/profile", AuthenticateUser, authorizeUser(["fundraiser"]), fundraiserCltr.getProfile);

// Create a fundraiser profile
router.post(
    "/profile",
    AuthenticateUser,
    authorizeUser(["fundraiser"]),
    upload.fields([{ name: 'profileImage', maxCount: 1 }]),
    checkSchema(fundraiserValidationSchema),
    fundraiserCltr.createProfile
);

// Update a fundraiser profile
router.put(
    "/profile",
    AuthenticateUser,
    authorizeUser(["fundraiser"]),
    upload.fields([{ name: 'profileImage', maxCount: 1 }]),
    checkSchema(fundraiserValidationSchema),
    fundraiserCltr.updateProfile
);

// Get fundraiser's causes
router.get("/causes", AuthenticateUser, authorizeUser(["fundraiser"]), fundraiserCltr.getFundraiserCauses);

export default router;
