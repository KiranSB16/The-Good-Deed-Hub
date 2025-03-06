import Donor from "../models/donor-model.js";
import Cause from "../models/cause-model.js";
import Donation from "../models/donation-model.js";
import { validationResult } from "express-validator";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/user-model.js";

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

// Update donor profile
donorCltr.updateProfile = async (req, res) => {
    try {
        const { name, mobileNumber } = req.body;
        const donor = await Donor.findOne({ userId: req.user.userId });

        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        // Update user name if provided
        if (name) {
            await User.findByIdAndUpdate(req.user.userId, { name });
        }

        // Update donor mobile number if provided
        if (mobileNumber) {
            donor.mobileNumber = mobileNumber;
            await donor.save();
        }

        // Get updated donor profile with populated user details
        const updatedDonor = await Donor.findOne({ userId: req.user.userId })
            .populate('userId', 'name email');

        res.json(updatedDonor);
    } catch (error) {
        console.error('Error updating donor profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// Get Donor Profile
donorCltr.getProfile = async (req, res) => {
    try {
        const donor = await Donor.findOne({ userId: req.user.userId })
            .populate('userId', 'name email');

        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        res.status(200).json(donor);
    } catch (error) {
        console.error('Error fetching donor profile:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};

// Get saved causes
donorCltr.getSavedCauses = async (req, res) => {
    try {
        const donor = await Donor.findOne({ userId: req.user.userId })
            .populate({
                path: 'savedCauses',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'fundraiserId', select: 'name email' }
                ]
            });

        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        res.json({ savedCauses: donor.savedCauses });
    } catch (error) {
        console.error('Error fetching saved causes:', error);
        res.status(500).json({ message: 'Failed to fetch saved causes' });
    }
};

// Save a cause
donorCltr.saveCause = async (req, res) => {
    try {
        const { causeId } = req.body;

        const donor = await Donor.findOne({ userId: req.user.userId });
        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        if (donor.savedCauses.includes(causeId)) {
            return res.status(400).json({ message: 'Cause already saved' });
        }

        donor.savedCauses.push(causeId);
        await donor.save();

        res.status(200).json({
            message: 'Cause saved successfully',
            savedCauses: donor.savedCauses
        });
    } catch (error) {
        console.error('Error saving cause:', error);
        res.status(500).json({ message: 'Failed to save cause' });
    }
};

// Unsave a cause
donorCltr.unsaveCause = async (req, res) => {
    try {
        const { causeId } = req.params;

        const donor = await Donor.findOne({ userId: req.user.userId });
        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        donor.savedCauses = donor.savedCauses.filter(id => id.toString() !== causeId);
        await donor.save();

        res.status(200).json({
            message: 'Cause removed from saved list',
            savedCauses: donor.savedCauses
        });
    } catch (error) {
        console.error('Error removing saved cause:', error);
        res.status(500).json({ message: 'Failed to remove saved cause' });
    }
};

// Get all donations for the donor
donorCltr.getDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.user._id })
            .populate({
                path: 'causeId',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'fundraiserId', select: 'name email' }
                ]
            })
            .sort({ createdAt: -1 });

        // Calculate total amount donated
        const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);

        // Get statistics
        const stats = {
            totalDonations: donations.length,
            totalAmountDonated: totalDonated,
            pendingDonations: donations.filter(d => d.status === 'pending').length,
            completedDonations: donations.filter(d => d.status === 'completed').length
        };

        res.json({ donations, stats });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Failed to fetch donations' });
    }
};

// Get donations for a specific cause
donorCltr.getDonationsByCause = async (req, res) => {
    try {
        const { causeId } = req.params;

        const donations = await Donation.find({
            donorId: req.user._id,
            causeId: causeId
        })
        .populate({
            path: 'causeId',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'fundraiserId', select: 'name email' }
            ]
        })
        .sort({ createdAt: -1 });

        const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);

        res.json({
            donations,
            stats: {
                totalDonations: donations.length,
                totalAmountDonated: totalDonated
            }
        });
    } catch (error) {
        console.error('Error fetching donations for cause:', error);
        res.status(500).json({ message: 'Failed to fetch donations for this cause' });
    }
};

// Create donation
donorCltr.createDonation = async (req, res) => {
    try {
        const { causeId, amount, message } = req.body;

        const cause = await Cause.findById(causeId);
        if (!cause) {
            return res.status(404).json({ message: 'Cause not found' });
        }

        if (cause.status !== 'approved') {
            return res.status(400).json({ message: 'Cannot donate to unapproved cause' });
        }

        const donation = new Donation({
            donorId: req.user.userId,
            causeId,
            amount,
            message,
            status: 'pending'
        });

        await donation.save();

        // Update cause amount (you might want to do this after payment confirmation)
        cause.currentAmount += amount;
        await cause.save();

        res.status(201).json({
            message: 'Donation created successfully',
            donation
        });
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ message: 'Failed to create donation' });
    }
};

// Get donor statistics
donorCltr.getStats = async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.user.userId });
        
        const stats = {
            totalDonations: donations.length,
            totalAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
            completedDonations: donations.filter(d => d.status === 'completed').length,
            pendingDonations: donations.filter(d => d.status === 'pending').length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching donor stats:', error);
        res.status(500).json({ message: 'Failed to fetch donor statistics' });
    }
};

export default donorCltr

