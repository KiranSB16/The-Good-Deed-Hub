import { validationResult } from "express-validator"
import { notifyCauseApproval, notifyCauseRejection } from "../utils/nodemailer.js"
import Cause from "../models/cause-model.js"
const adminCltr = {}
adminCltr.approveCause = async(req , res) => {
    try{
    const id = req.params.id
    const cause = await Cause.findById(id).populate("fundraiserId", "email name");
    if(!cause){
       return res.status(404).json("cause not found")
    }
    cause.status = "approved"
    cause.rejectionMessage = null
    await cause.save()
    await notifyCauseApproval(cause.fundraiserId, cause);
    res.status(200).json({message:"cause approved successfully", cause})
    } catch(err) {
        console.log(err)
        res.status(500).json("something went wrong")
    }
}

adminCltr.rejectCause = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error : errors.array()})
    }
    try {
      const id = req.params.id;
      const { rejectionMessage } = req.body;
      
  
      if (!rejectionMessage) {
        return res.status(400).json({ message: "Rejection message is required." });
      }

      const cause = await Cause.findById(id).populate("fundraiserId", "email name");
      if (!cause) {
        return res.status(404).json({ message: "Cause not found." });
      }

      cause.status = "rejected";
      cause.rejectionMessage = rejectionMessage;
      await cause.save();
      notifyCauseRejection(cause.fundraiserId , cause)
      res.status(200).json({ message: "Cause rejected successfully.", cause });

    } catch (err) {
      console.error("Error in Reject Cause Controller:", err); // Debug
      res.status(500).json({ message: "Something went wrong.", error: err.message });
    }
  };
  
export default adminCltr
