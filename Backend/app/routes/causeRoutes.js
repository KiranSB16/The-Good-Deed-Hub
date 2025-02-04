import express from "express"
import {AuthenticateUser} from "../middlewares/authentication.js";
import authorizeUser from "../middlewares/authorization.js";
import causeCltr from "../controllers/cause-cltr.js";
import { handleValidationErrors } from "../middlewares/validate.js";

import {createCauseValidation} from "../validators/cause-validation-schema.js"

const router = express.Router();

router.post('/causes', 
  AuthenticateUser, 
  authorizeUser(['fundraiser']),
  handleValidationErrors(createCauseValidation) , 
  causeCltr.create)

router.get('/causes' , AuthenticateUser, causeCltr.list)
router.get("/causes/:id", AuthenticateUser, causeCltr.show)
router.put("/causes/:id",AuthenticateUser , authorizeUser(['admin' , 'fundraiser']) ,causeCltr.update )
router.delete("/causes/:id", AuthenticateUser , authorizeUser(["admin" , "fundraiser"]) , causeCltr.delete)


export default router
