import express from "express";
import { AuthenticateUser } from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import donorCltr from "../controllers/donor-cltr.js";
import { checkSchema } from "express-validator";
import { donorValidationSchema } from "../validators/donor-validation-schema.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Profile routes
router.get("/profile", AuthenticateUser, authorizeUser(['donor']), donorCltr.getProfile);
router.post("/profile", AuthenticateUser, donorCltr.createProfile);
router.put("/profile", AuthenticateUser, upload.single('profileImage'), donorCltr.updateProfile);

// Stats route
router.get('/stats', AuthenticateUser, authorizeUser(['donor']), donorCltr.getStats);

// Saved causes routes
router.get('/saved-causes', AuthenticateUser, authorizeUser(['donor']), donorCltr.getSavedCauses);
router.post('/save-cause', AuthenticateUser, authorizeUser(['donor']), donorCltr.saveCause);
router.delete('/saved-causes/:causeId', AuthenticateUser, authorizeUser(['donor']), donorCltr.unsaveCause);

// Donation routes
router.get('/donations', AuthenticateUser, authorizeUser(['donor']), donorCltr.getDonations);
router.get('/donations/:causeId', AuthenticateUser, authorizeUser(['donor']), donorCltr.getDonationsByCause);
router.post('/donations/:causeId', AuthenticateUser, authorizeUser(['donor']), donorCltr.createDonation);

export default router;
