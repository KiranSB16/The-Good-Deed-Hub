import { Schema, model } from "mongoose";
const feedbackSchema = new Schema(
  {
    donorId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Donor giving feedback
    causeId: { type: Schema.Types.ObjectId, ref: "Cause", required: true }, // Cause being reported
    message: { type: String, required: true, minlength: 10 }, // Report message
    status: {
      type: String,
      enum: ["pending", "reviewed", "action_required"],
      default: "pending",
    }, // Status of feedback
    adminResponse: { type: String }, 
    fundraiserResponse: { type: String }, // Fundraiser's response to the admin's query
  },
  { timestamps: true }
);

const Feedback = model("Feedback", feedbackSchema);
export default Feedback;
