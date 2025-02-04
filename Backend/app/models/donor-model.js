import mongoose from "mongoose"
import {Schema , model} from "mongoose"
const donorSchema = new Schema({
  userId : {type : mongoose.Schema.Types.ObjectId , ref : "User"},
  profileImage : [String],
  totalDonations : Number,
  mobileNumber : Number,
  savedCauses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cause',
    },
  ],
})
const Donor = model("Donor" , donorSchema)
export default Donor