import express from "express";
import { AuthenticateUser } from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import donorCltr from "../controllers/donor-cltr.js";
import { checkSchema } from "express-validator";
import { donorValidationSchema } from "../validators/donor-validation-schema.js";

const router = express.Router();

router.post(
    "/donor/profile",
    AuthenticateUser,
    authorizeUser(["donor"]),
    checkSchema(donorValidationSchema),
    donorCltr.createProfile
);

router.put(
    "/donor/profile",
    AuthenticateUser,
    authorizeUser(["donor"]),
    checkSchema(donorValidationSchema),
    donorCltr.updateProfile
)

router.get("/donor/profile", AuthenticateUser, donorCltr.getProfile);

export default router;
