import Donor from "../models/donor-model.js";
import { validationResult } from "express-validator";

export const donorCltr = {};

// Create or Update Donor Profile
donorCltr.createOrUpdateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mobileNumber } = req.body;
        //const profileImage = req.files?.profileImage ? req.files.profileImage.map(file => file.path) : [];

        let donor = await Donor.findOne({ userId: req.user.userId }).populate("userId" , "name email")

        if (donor) {
            // Update profile
            donor.mobileNumber = mobileNumber || donor.mobileNumber;
            //donor.profileImage = profileImage.length > 0 ? profileImage : donor.profileImage;
            await donor.save();
            return res.status(200).json({ message: "Donor profile updated successfully", donor });
        } else {
            // Create new profile
            donor = new Donor({
                userId: req.user.userId,
                mobileNumber,
                //profileImage,
            });
            await donor.save();
            return res.status(201).json({ message: "Donor profile created successfully", donor });
        }
    } catch (err) {
        console.log(err)
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

