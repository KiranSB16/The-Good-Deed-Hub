import {Schema , model} from "mongoose"
const feedbackSchema = new Schema({
  feedbackId: { type: mongoose.Schema.Types.ObjectId},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  causeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cause' },
  rating: { type: Number, min: 1, max: 5 },
  comments:  String,
} , {timestamps : true});

const Feedback = model('Feedback', feedbackSchema)
export default Feedback