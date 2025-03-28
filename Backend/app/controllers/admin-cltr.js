import { validationResult } from "express-validator"
import { notifyCauseApproval, notifyCauseRejection } from "../utils/nodemailer.js"
import Cause from "../models/cause-model.js"
import Category from "../models/category-model.js"
import User from "../models/user-model.js"
import Donation from "../models/donation-model.js"
import { analyticsResponseSchema } from "../validators/analytics-validation-schema.js"

const adminCltr = {}

// Category Management
adminCltr.listCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({
            message: "Failed to fetch categories",
            error: err.message
        });
    }
};

adminCltr.createCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;
        const category = new Category({ name });
        await category.save();
        res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (err) {
        console.error("Error creating category:", err);
        res.status(500).json({
            message: "Failed to create category",
            error: err.message
        });
    }
};

adminCltr.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({
            message: "Category deleted successfully",
            category
        });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({
            message: "Failed to delete category",
            error: err.message
        });
    }
};

// Cause Management
adminCltr.approveCause = async(req , res) => {
    try {
        const id = req.params.id;
        const cause = await Cause.findById(id).populate("fundraiserId", "email name");
        
        if (!cause) {
            return res.status(404).json({ message: "Cause not found" });
        }
        
        if (!cause.fundraiserId || !cause.fundraiserId.email) {
            console.error("Fundraiser email not found for cause:", id);
            return res.status(400).json({ message: "Fundraiser email not found" });
        }
        
        cause.status = "approved";
        cause.rejectionMessage = null;
        await cause.save();
        
        await notifyCauseApproval(cause.fundraiserId, cause, cause.fundraiserId.email);
        
        res.status(200).json({
            message: "Cause approved successfully",
            cause
        });
    } catch (err) {
        console.error("Error in Approve Cause Controller:", err);
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
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
      console.error("Error in Reject Cause Controller:", err);
      res.status(500).json({ message: "Something went wrong.", error: err.message });
    }
};

// Get all causes with status filter
adminCltr.listCauses = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        console.log('Admin listCauses - Query parameters:', req.query);
        console.log('Admin listCauses - Constructed query:', query);

        const causes = await Cause.find(query)
            .populate("fundraiserId", "name email")
            .populate("category", "name");

        console.log('Admin listCauses - Found causes:', {
            total: causes.length,
            statusBreakdown: causes.reduce((acc, cause) => {
                acc[cause.status] = (acc[cause.status] || 0) + 1;
                return acc;
            }, {}),
            pendingApprovalCount: causes.filter(c => c.status === 'pending approval').length
        });

        res.status(200).json(causes);
    } catch (err) {
        console.error("Error fetching causes:", err);
        res.status(500).json({
            message: "Failed to fetch causes",
            error: err.message
        });
    }
};

// Test route to check cause statuses
adminCltr.testCauses = async (req, res) => {
    try {
        const causes = await Cause.find({});
        const statusCounts = causes.reduce((acc, cause) => {
            acc[cause.status] = (acc[cause.status] || 0) + 1;
            return acc;
        }, {});

        res.json({
            total: causes.length,
            statusCounts,
            causes: causes.map(c => ({
                id: c._id,
                title: c.title,
                status: c.status,
                fundraiserId: c.fundraiserId
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get analytics data
adminCltr.getAnalytics = async (req, res) => {
    try {
        // Get total users by role
        const totalUsers = await User.countDocuments();
        const totalDonors = await User.countDocuments({ role: 'donor' });
        const totalFundraisers = await User.countDocuments({ role: 'fundraiser' });

        // Get causes statistics
        const totalCauses = await Cause.countDocuments();
        const activeCauses = await Cause.countDocuments({ status: 'approved' });
        const completedCauses = await Cause.countDocuments({ status: 'completed' });
        const pendingCauses = await Cause.countDocuments({ status: 'pending' });

        // Get total donations and amount
        const donations = await Donation.find();
        const totalDonations = donations.length;
        const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);

        // Get category distribution for causes
        const categories = await Category.find();
        const categoryDistribution = await Promise.all(
            categories.map(async (category) => {
                const count = await Cause.countDocuments({ category: category._id });
                return {
                    name: category.name,
                    count
                };
            })
        );

        // Get category-wise donation data
        const categoryDonations = await Donation.aggregate([
            {
                $lookup: {
                    from: "causes",
                    localField: "causeId",
                    foreignField: "_id",
                    as: "cause"
                }
            },
            {
                $unwind: "$cause"
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "cause.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category.name",
                    totalAmount: { $sum: "$amount" },
                    donationCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    totalAmount: 1,
                    donationCount: 1,
                    _id: 0
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);

        const analyticsData = {
            users: {
                total: totalUsers,
                donors: totalDonors,
                fundraisers: totalFundraisers
            },
            causes: {
                total: totalCauses,
                active: activeCauses,
                completed: completedCauses,
                pending: pendingCauses
            },
            donations: {
                total: totalDonations,
                amount: totalAmount
            },
            categoryDistribution,
            categoryDonations
        };

        // Validate the response data
        const result = validationResult(analyticsData);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        res.json(analyticsData);
    } catch (err) {
        console.error("Error fetching analytics:", err);
        res.status(500).json({
            message: "Failed to fetch analytics data",
            error: err.message
        });
    }
};

export default adminCltr
