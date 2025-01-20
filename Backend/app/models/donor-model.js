import {Schema , model} from "mongoose"
const donorSchema = new Schema({
  name : String,
  email: String,
  password : String,
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