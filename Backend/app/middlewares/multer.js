// import multer from 'multer'

// const storage = multer.diskStorage({
//   filename: function (req,file,cb) {
//     cb(null, file.originalname)
//   }
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only JPEG, JPG ,PNG, or PDF files are allowed"));
//     }
//   },
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
// });

// export default upload

import multer from 'multer';

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    console.log("In the filename")
    cb(null, file.originalname);
  }
});
console.log("in the multer")

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("in the multer")
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, PNG, or PDF files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit per file
});

export default upload;
