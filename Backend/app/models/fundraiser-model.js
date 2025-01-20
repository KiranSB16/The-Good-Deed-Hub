import {Schema , model} from "mongoose"
const fundraiserSchema = new Schema({
  name : String,
  email: String,
  password : String,
  profileImage : [String],
  mobileNumber : Number,
  causes: [
    {
      category: {
        type: String,
      },
      causeList: [
        {
          causeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cause',
          }
        }
      ]
    }
  ]
})
const Fundraiser = model("Fundraiser" , fundraiserSchema)
export default Fundraiser