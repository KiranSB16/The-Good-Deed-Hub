// import cloudinary from '../utils/cloudinary.js';
// import fs from 'fs';

// export const uploadFile = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         // Upload to Cloudinary
//         const result = await cloudinary.uploader.upload(req.file.path, {
//             folder: 'good-deed-hub',
//             resource_type: 'auto'
//         });

//         // Delete the local file
//         fs.unlinkSync(req.file.path);

//         // Return the Cloudinary URL
//         res.json({
//             url: result.secure_url,
//             public_id: result.public_id
//         });
//     } catch (error) {
//         console.error('Upload error:', error);
//         res.status(500).json({ message: 'Error uploading file' });
//     }
// };

export const uploadFile = async (req, res) => {
  console.log("Uploading file")
  try {
    if (!req.files || (!req.files.images && !req.files.documents)) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Add file type validation
    const validateFile = (file) => {
      const allowedImageTypes = ['image/jpeg', 'image/png'];
      const allowedDocTypes = ['application/pdf'];
      
      if (file.fieldname === 'images' && !allowedImageTypes.includes(file.mimetype)) {
        throw new Error(`Invalid image type for ${file.originalname}`);
      }
      if (file.fieldname === 'documents' && !allowedDocTypes.includes(file.mimetype)) {
        throw new Error(`Invalid document type for ${file.originalname}`);
      }
    };

    // Validate all files before upload
    [...(req.files.images || []), ...(req.files.documents || [])].forEach(validateFile);

    // Rest of your existing upload code...
    const imageUploadPromises = req.files.images
      ? req.files.images.map((file) =>
          cloudinary.uploader.upload(file.path, { folder: 'good-deed-hub/images' })
        )
      : [];

    const documentUploadPromises = req.files.documents
      ? req.files.documents.map((file) =>
          cloudinary.uploader.upload(file.path, { folder: 'good-deed-hub/documents', resource_type: 'raw' })
        )
      : [];

    const imageResults = await Promise.all(imageUploadPromises);
    const documentResults = await Promise.all(documentUploadPromises);

    const imageUrls = imageResults.map((result) => result.secure_url);
    const documentUrls = documentResults.map((result) => result.secure_url);

    // Cleanup files
    [...(req.files.images || []), ...(req.files.documents || [])].forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Error deleting file ${file.path}:`, err);
      }
    });

    res.json({
      images: imageUrls,
      documents: documentUrls
    });

  } catch (error) {
    // Cleanup files on error
    if (req.files) {
      [...(req.files.images || []), ...(req.files.documents || [])].forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(`Error deleting file ${file.path}:`, err);
        }
      });
    }

    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading files',
      error: error.message 
    });
  }
};