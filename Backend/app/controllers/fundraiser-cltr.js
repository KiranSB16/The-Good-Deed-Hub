import Fundraiser from "../models/fundraiser-model.js";
import User from "../models/user-model.js";
import Cause from "../models/cause-model.js";
import { validationResult } from "express-validator";
import cloudinary from "../utils/cloudinary.js";

// Create or Update Fundraiser Profile
export const fundraiserCltr = {};

fundraiserCltr.createProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mobileNumber } = req.body;
        let profileImageUrl = [];

        // Handle profile image upload
        if (req.files?.profileImage) {
            try {
                const uploadPromises = req.files.profileImage.map(file =>
                    cloudinary.uploader.upload(file.path, {
                        folder: "fundraiser-profiles",
                        resource_type: "image"
                    })
                );
                const uploadResults = await Promise.all(uploadPromises);
                profileImageUrl = uploadResults.map(result => result.secure_url);
            } catch (uploadError) {
                console.error("Error uploading to Cloudinary:", uploadError);
                return res.status(500).json({ message: "Error uploading profile image" });
            }
        }

        // Check if the fundraiser profile already exists
        const existingFundraiser = await Fundraiser.findOne({ userId: req.user.userId });

        if (existingFundraiser) {
            return res.status(400).json({ message: "Profile already exists. Use update instead." });
        }

        // Create new fundraiser profile
        const fundraiser = new Fundraiser({
            userId: req.user.userId,
            mobileNumber,
            profileImage: profileImageUrl,
        });

        await fundraiser.save();
        
        // Populate user details
        await fundraiser.populate("userId", "name email");

        return res.status(201).json({
            message: "Fundraiser profile created successfully",
            fundraiser
        });
    } catch (error) {
        console.error("Error creating fundraiser profile:", error);
        res.status(500).json({ message: "Failed to create profile" });
    }
};

fundraiserCltr.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mobileNumber } = req.body;
        let profileImageUrl = [];

        // Handle profile image upload
        if (req.files?.profileImage) {
            try {
                const uploadPromises = req.files.profileImage.map(file =>
                    cloudinary.uploader.upload(file.path, {
                        folder: "fundraiser-profiles",
                        resource_type: "image"
                    })
                );
                const uploadResults = await Promise.all(uploadPromises);
                profileImageUrl = uploadResults.map(result => result.secure_url);
            } catch (uploadError) {
                console.error("Error uploading to Cloudinary:", uploadError);
                return res.status(500).json({ message: "Error uploading profile image" });
            }
        }

        let fundraiser = await Fundraiser.findOne({ userId: req.user.userId })
            .populate("userId", "name email");

        if (!fundraiser) {
            return res.status(404).json({ message: "Fundraiser profile not found" });
        }

        // Update profile fields
        fundraiser.mobileNumber = mobileNumber;
        if (profileImageUrl.length > 0) {
            fundraiser.profileImage = profileImageUrl;
        }

        await fundraiser.save();

        return res.status(200).json({
            message: "Fundraiser profile updated successfully",
            fundraiser
        });
    } catch (error) {
        console.error("Error updating fundraiser profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

// Get Fundraiser Profile
fundraiserCltr.getProfile = async (req, res) => {
    try {
        const fundraiser = await Fundraiser.findOne({ userId: req.user.userId })
            .populate("userId", "name email");

        if (!fundraiser) {
            return res.status(404).json({ message: "Fundraiser profile not found" });
        }

        res.status(200).json(fundraiser);
    } catch (error) {
        console.error("Error fetching fundraiser profile:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

// Get Fundraiser's Causes
fundraiserCltr.getFundraiserCauses = async (req, res) => {
    try {
        console.log('User ID from request:', req.user.userId);

        // Find causes where fundraiserId matches the user's ID
        const causes = await Cause.find({ 
            fundraiserId: req.user.userId 
        })
        .populate({
            path: 'fundraiserId',
            select: 'name email'
        })
        .populate('category', 'name');

        // Log each cause for debugging
        causes.forEach(cause => {
            console.log('Found cause:', {
                id: cause._id,
                status: cause.status,
                title: cause.title
            });
        });
        
        // Calculate statistics with exact status matching
        const approvedCauses = causes.filter(cause => cause.status === 'approved');
        const pendingCauses = causes.filter(cause => cause.status === 'pending approval');
        
        console.log('Filtered causes:', {
            total: causes.length,
            approved: approvedCauses.length,
            pending: pendingCauses.length
        });

        const stats = {
            totalCauses: causes.length,
            totalRaised: causes.reduce((sum, cause) => sum + (cause.currentAmount || 0), 0),
            approvedCauses: approvedCauses.length,
            pendingCauses: pendingCauses.length
        };

        res.json({
            causes: causes.map(cause => ({
                ...cause.toObject(),
                status: cause.status.toLowerCase() // Normalize status to lowercase
            })),
            stats
        });
    } catch (error) {
        console.error("Error fetching fundraiser causes:", error);
        res.status(500).json({ message: "Failed to fetch causes" });
    }
};


