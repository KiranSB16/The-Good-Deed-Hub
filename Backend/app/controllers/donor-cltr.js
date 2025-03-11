import Donor from "../models/donor-model.js";
import Cause from "../models/cause-model.js";
import Donation from "../models/donation-model.js";
import { validationResult } from "express-validator";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/user-model.js";
import fs from "fs";

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
        // Parse form data
        const formData = JSON.parse(req.body.formData || '{}');
        const { name, mobileNumber, address, bio } = formData;
        
        // Find or create donor profile
        let donor = await Donor.findOne({ userId: req.user.userId });
        
        if (!donor) {
            // Create new donor profile if it doesn't exist
            donor = new Donor({
                userId: req.user.userId,
                name: name || '',
                mobileNumber: mobileNumber || '',
                address: address || '',
                bio: bio || '',
                savedCauses: []
            });
        } else {
            // Update existing profile
            if (name !== undefined) donor.name = name;
            if (mobileNumber !== undefined) donor.mobileNumber = mobileNumber;
            if (address !== undefined) donor.address = address;
            if (bio !== undefined) donor.bio = bio;
        }

        // Handle profile image upload
        if (req.file) {
            try {
                // Upload to cloudinary
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'profile_images',
                    width: 300,
                    crop: 'scale'
                });

                // Delete the temporary file
                fs.unlinkSync(req.file.path);

                // Update donor's profile image
                donor.profileImage = result.secure_url;
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                // If there's a temporary file, delete it
                if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(500).json({ message: 'Error uploading profile image' });
            }
        }

        await donor.save();
        
        // Populate user details and update user model
        const user = await User.findById(req.user.userId);
        if (user) {
            user.name = name || user.name;
            await user.save();
        }

        const populatedDonor = await Donor.findOne({ userId: req.user.userId })
            .populate('userId', 'name email')
            .lean();

        if (!populatedDonor) {
            return res.status(404).json({ message: 'Donor profile not found after update' });
        }

        // Combine user and donor data for response
        const responseData = {
            ...user.toObject(),
            ...populatedDonor,
            profileImage: populatedDonor.profileImage,
            mobileNumber: populatedDonor.mobileNumber,
            address: populatedDonor.address,
            bio: populatedDonor.bio
        };
        delete responseData.password;
        delete responseData.resetPasswordOTP;
        delete responseData.resetPasswordExpires;

        res.json(responseData);
    } catch (error) {
        console.error('Error updating profile:', error);
        // If there's a temporary file, delete it
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ 
            message: 'Failed to update profile',
            error: error.message 
        });
    }
};

// Get Donor Profile
donorCltr.getProfile = async (req, res) => {
    try {
        let donor = await Donor.findOne({ userId: req.user.userId })
            .populate('userId', 'name email');

        if (!donor) {
            // Create a new donor profile if it doesn't exist
            donor = new Donor({
                userId: req.user.userId,
                savedCauses: []
            });
            await donor.save();
            donor = await Donor.findOne({ userId: req.user.userId })
                .populate('userId', 'name email');
        }

        res.json(donor);
    } catch (error) {
        console.error('Error fetching donor profile:', error);
        res.status(500).json({ message: 'Failed to fetch donor profile' });
    }
};

// Get saved causes
donorCltr.getSavedCauses = async (req, res) => {
    try {
        // Find or create donor profile
        let donor = await Donor.findOne({ userId: req.user.userId })
            .populate({
                path: 'savedCauses',
                populate: [
                    { 
                        path: 'category',
                        select: 'name'
                    },
                    { 
                        path: 'fundraiserId',
                        select: 'name email'
                    }
                ]
            })
            .lean();

        // If donor profile doesn't exist, create one
        if (!donor) {
            const newDonor = new Donor({
                userId: req.user.userId,
                savedCauses: []
            });
            await newDonor.save();
            donor = {
                ...newDonor.toObject(),
                savedCauses: []
            };
        }

        // Filter out any null values that might have occurred due to deleted causes
        const savedCauses = (donor.savedCauses || []).filter(cause => cause !== null);

        res.json({ 
            savedCauses,
            total: savedCauses.length
        });
    } catch (error) {
        console.error('Error fetching saved causes:', error);
        res.status(500).json({ 
            message: 'Failed to fetch saved causes',
            error: error.message
        });
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
        // Find or create donor profile
        let donor = await Donor.findOne({ userId: req.user.userId });
        if (!donor) {
            donor = new Donor({
                userId: req.user.userId,
                savedCauses: []
            });
            await donor.save();
        }

        // Find donations with proper population
        const donations = await Donation.find({ donorId: req.user.userId })
            .populate({
                path: 'causeId',
                populate: [
                    { 
                        path: 'category',
                        select: 'name'
                    },
                    { 
                        path: 'fundraiserId',
                        select: 'name email'
                    }
                ]
            })
            .sort({ createdAt: -1 })
            .lean();

        // Calculate statistics
        const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
        const pendingDonations = donations.filter(d => d.status === 'pending');
        const completedDonations = donations.filter(d => d.status === 'completed');

        const stats = {
            totalDonations: donations.length,
            totalAmountDonated: totalAmount,
            pendingDonations: pendingDonations.length,
            completedDonations: completedDonations.length
        };

        res.json({
            donations,
            stats
        });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ 
            message: 'Failed to fetch donations',
            error: error.message
        });
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

