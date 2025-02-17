import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import upload from '../middlewares/multer.js';
import { AuthenticateFundraiser } from '../middlewares/authentication.js';

const router = express.Router();

// Allow multiple file uploads for images and documents
router.post(
  '/',
  AuthenticateFundraiser,
  upload.fields([
    { name: 'images', maxCount: 5 }, // Allow up to 5 images
    { name: 'documents', maxCount: 3 } // Allow up to 3 documents
  ]),
  uploadFile
);

export default router;
