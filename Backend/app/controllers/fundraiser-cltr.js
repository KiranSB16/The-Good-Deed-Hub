import Fundraiser from "../models/fundraiser-model.js";
import User from "../models/user-model.js";
import { validationResult } from "express-validator";

// Create or Update Fundraiser Profile
export const fundraiserCltr = {};

fundraiserCltr.createProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mobileNumber } = req.body;
        //const profileImage = req.files?.profileImage ? req.files.profileImage.map(file => file.path) : [];

        // Check if the fundraiser profile already exists
        const existingFundraiser = await Fundraiser.findOne({ userId: req.user.userId });

        if (existingFundraiser) {
            return res.status(400).json({ message: "Profile already exists. Use update instead." });
        }

        // Create new fundraiser profile
        const fundraiser = new Fundraiser({
            userId: req.user.userId,
            mobileNumber,
            //profileImage,
        });

        await fundraiser.save();

        return res.status(201).json({ message: "Fundraiser profile created successfully", fundraiser });
    } catch (error) {
        console.error("Error creating fundraiser profile:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

fundraiserCltr.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mobileNumber } = req.body;
        //const profileImage = req.files?.profileImage ? req.files.profileImage.map(file => file.path) : [];

        let fundraiser = await Fundraiser.findOne({ userId: req.user.userId })
            .populate("userId", "name email")
            .populate("causes", "title description goalAmount status");

        if (!fundraiser) {
            return res.status(404).json({ message: "Fundraiser profile not found" });
        }

        // Update profile fields
        fundraiser.mobileNumber = mobileNumber || fundraiser.mobileNumber;
        //fundraiser.profileImage = profileImage.length > 0 ? profileImage : fundraiser.profileImage;

        await fundraiser.save();

        return res.status(200).json({ message: "Fundraiser profile updated successfully", fundraiser });
    } catch (error) {
        console.error("Error updating fundraiser profile:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};


// Get Fundraiser Profile
fundraiserCltr.getProfile = async (req, res) => {
    try {
        const fundraiser = await Fundraiser.findOne({ userId: req.user.userId }).populate("userId", "name email");
        if (!fundraiser) {
            return res.status(404).json({ message: "Fundraiser profile not found" });
        }
        res.status(200).json(fundraiser);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
};


