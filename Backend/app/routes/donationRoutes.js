import express from 'express';
import { AuthenticateUser } from '../middlewares/authentication.js';
import authorizeUser from '../middlewares/authorization.js';
import donationCltr from '../controllers/donation-cltr.js';

const router = express.Router();

// Create a new donation
router.post(
    '/',
    AuthenticateUser,
    authorizeUser(['donor']),
    donationCltr.create
);

// Get donor's donations
router.get(
    '/my-donations',
    AuthenticateUser,
    authorizeUser(['donor']),
    donationCltr.getMyDonations
);

// Get recommended causes
router.get(
    '/recommended',
    AuthenticateUser,
    authorizeUser(['donor']),
    donationCltr.getRecommendedCauses
);

export default router;
