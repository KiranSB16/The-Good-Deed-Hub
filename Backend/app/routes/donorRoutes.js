import express from "express";
import { AuthenticateUser, authenticateDonor } from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import donorCltr from "../controllers/donor-cltr.js";
import { checkSchema } from "express-validator";
import { donorValidationSchema } from "../validators/donor-validation-schema.js";

const router = express.Router();

// Apply donor authentication middleware to all routes
router.use(authenticateDonor);

// Profile routes
router.get("/profile", donorCltr.getProfile);
router.put("/profile", donorCltr.updateProfile);

// Stats route
router.get('/stats', donorCltr.getStats);

// Saved causes routes
router.get('/saved-causes', donorCltr.getSavedCauses);
router.post('/saved-causes', donorCltr.saveCause);
router.delete('/saved-causes/:causeId', donorCltr.unsaveCause);

// Donation routes
router.get('/my-donations', donorCltr.getDonations);
router.get('/donations/:causeId', donorCltr.getDonationsByCause);
router.post('/donations/:causeId', donorCltr.createDonation);

export default router;
