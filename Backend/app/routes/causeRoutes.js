import express from "express"
import upload from "../middlewares/multer.js";
import {AuthenticateUser} from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import causeCltr from "../controllers/cause-cltr.js";
import { handleValidationErrors } from "../middlewares/validate.js";

import {createCauseValidation} from "../validators/cause-validation-schema.js"

const router = express.Router();

router.post('/', upload.fields([
  { name: "images", maxCount: 4 }, // Max 5 images
  { name: "documents", maxCount: 1 }, // Max 3 documents
  ]),
  AuthenticateUser, 
  authorizeUser(['fundraiser']),
  handleValidationErrors(createCauseValidation) , 
  causeCltr.create)

router.get('/' , AuthenticateUser, causeCltr.list)
router.get('/:id' , AuthenticateUser, causeCltr.show)
router.put('/:id' , AuthenticateUser, authorizeUser(['fundraiser', 'admin']), causeCltr.update)
router.delete('/:id' , AuthenticateUser, authorizeUser(['fundraiser', 'admin']), causeCltr.delete)

export default router
