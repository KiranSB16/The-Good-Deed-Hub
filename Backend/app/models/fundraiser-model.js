import mongoose, {Schema , model} from "mongoose"
const fundraiserSchema = new Schema({
  userId : {type : mongoose.Schema.Types.ObjectId , ref : "User"},
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