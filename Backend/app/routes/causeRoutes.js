import express from "express"
import upload from "../middlewares/multer.js";
import {AuthenticateUser} from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import causeCltr from "../controllers/cause-cltr.js";
import { handleValidationErrors } from "../middlewares/validate.js";

import {createCauseValidation} from "../validators/cause-validation-schema.js"

const router = express.Router();

// Create a new cause
router.post('/', 
    upload.fields([
        { name: "images", maxCount: 4 },
        { name: "documents", maxCount: 1 }
    ]),
    AuthenticateUser, 
    authorizeUser(['fundraiser']),
    handleValidationErrors(createCauseValidation), 
    causeCltr.create
);

// List all causes
router.get('/', AuthenticateUser, causeCltr.list);

// Get cause counts by status
router.get('/count', AuthenticateUser, causeCltr.count);

// Get a single cause
router.get('/:id', AuthenticateUser, causeCltr.show);

// Update a cause
router.put('/:id', 
    upload.fields([
        { name: "images", maxCount: 4 },
        { name: "documents", maxCount: 1 }
    ]),
    AuthenticateUser, 
    authorizeUser(['fundraiser', 'admin']), 
    causeCltr.update
);

// Delete a cause
router.delete('/:id', 
    AuthenticateUser, 
    authorizeUser(['fundraiser', 'admin']), 
    causeCltr.delete
);

// Update cause status (approve/reject)
router.put('/:id/status', 
    AuthenticateUser, 
    authorizeUser(['admin']), 
    causeCltr.updateStatus
);

// Get donations for a specific cause
router.get('/:id/donations', AuthenticateUser, causeCltr.getDonations);

export default router
