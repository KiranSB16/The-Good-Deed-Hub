import Review from "../models/review-model.js"
import User from "../models/user-model.js"
import { validationResult } from "express-validator"

// Controller object
const reviewCltr = {}

// **Create a review**
reviewCltr.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { revieweeId, rating, comment } = req.body

    // Ensure the reviewee exists
    const reviewee = await User.findById(revieweeId)
    if (!reviewee) {
      return res.status(404).json({ message: "User to be reviewed not found" })
    }

    // Determine the role of the person being reviewed
    const role = reviewee.role === "fundraiser" ? "fundraiser" : "donor"

    // Create review
    const review = new Review({
      reviewer: req.user.userId, // The person submitting the review
      reviewee: revieweeId, // The person being reviewed
      role,
      rating,
      comment,
    });

    await review.save()
    res.status(201).json({ message: "Review submitted successfully", review })
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review", error: error.message })
  }
};

// **Get all reviews for a specific user**
reviewCltr.getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ reviewee: id }).populate("reviewer", "name profileImage")

    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found for this user" })
    }

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message })
  }
};

// **Get top-rated donors**
reviewCltr.getTopDonors = async (req, res) => {
  try {
    const topDonors = await Review.aggregate([
      { $match: { role: "donor" } },
      { $group: { _id: "$reviewee", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 5 },
      { 
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          profileImage: "$userDetails.profileImage",
          avgRating: 1,
          count: 1
        }
      }
    ]);

    res.status(200).json(topDonors)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top donors", error: error.message })
  }
};

export default reviewCltr
