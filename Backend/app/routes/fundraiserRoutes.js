import express from "express";
import { AuthenticateUser } from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import {fundraiserCltr} from "../controllers/fundraiser-cltr.js";
import { checkSchema } from "express-validator";
import { fundraiserValidationSchema } from "../validators/fundraiser-validation-schema.js";

const router = express.Router();

// Create a fundraiser profile
router.post(
    "/fundraisers",
    AuthenticateUser,
    authorizeUser(["fundraiser"]),
    checkSchema(fundraiserValidationSchema),
    fundraiserCltr.createProfile
);

// Update a fundraiser profile
router.put(
    "/fundraisers",
    AuthenticateUser,
    authorizeUser(["fundraiser"]),
    checkSchema(fundraiserValidationSchema),
    fundraiserCltr.updateProfile
);

router.get("/fundraisers", AuthenticateUser, fundraiserCltr.getProfile);

export default router;
