import mongoose, { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The person giving the review
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The person receiving the review
    role: { type: String, enum: ["donor", "fundraiser"], required: true }, // Who is being reviewed
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const Review = model("Review", reviewSchema);
export default Review;
