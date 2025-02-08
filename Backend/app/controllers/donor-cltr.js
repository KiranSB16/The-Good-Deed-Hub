import Donor from "../models/donor-model.js";
import { validationResult } from "express-validator";

const donorCltr = {};

donorCltr.createProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mobileNumber } = req.body;
        //const profileImage = req.files?.profileImage ? req.files.profileImage.map(file => file.path) : [];

        // Check if donor profile already exists
        const existingDonor = await Donor.findOne({ userId: req.user.userId });
        if (existingDonor) {
            return res.status(400).json({ message: "Donor profile already exists. Please update instead." });
        }

        // Create new donor profile
        const newDonor = new Donor({
            userId: req.user.userId,
            mobileNumber,
            //profileImage,
        });

        await newDonor.save();
        res.status(201).json({ message: "Donor profile created successfully", donor: newDonor });
    } catch (err) {
        console.error("Error creating donor profile:", err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
};

donorCltr.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mobileNumber } = req.body;
        //const profileImage = req.files?.profileImage ? req.files.profileImage.map(file => file.path) : [];

        // Find the donor profile
        let donor = await Donor.findOne({ userId: req.user.userId }).populate("userId", "name email");

        if (!donor) {
            return res.status(404).json({ message: "Donor profile not found. Please create one first." });
        }

        // Update donor profile
        donor.mobileNumber = mobileNumber || donor.mobileNumber;
        //donor.profileImage = profileImage.length > 0 ? profileImage : donor.profileImage;

        await donor.save();
        res.status(200).json({ message: "Donor profile updated successfully", donor });
    } catch (err) {
        console.error("Error updating donor profile:", err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
};



// Get Donor Profile
donorCltr.getProfile = async (req, res) => {
    try {
        const donor = await Donor.findOne({userId :req.user.userId} ).populate("userId", "name email");
        if (!donor) {
            return res.status(404).json({ message: "Donor profile not found" });
        }
        res.status(200).json(donor);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
};

export default donorCltr

