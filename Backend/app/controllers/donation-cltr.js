import Donation from '../models/donation-model.js'
import Donor from '../models/donor-model.js'
import Cause from '../models/cause-model.js'
import { validationResult } from 'express-validator'

const donationCltr = {}

// Create a new donation
donationCltr.create = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { causeId, amount, paymentMethod, message, isAnonymous } = req.body

        // Find donor
        const donor = await Donor.findOne({ userId: req.user.userId })
        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' })
        }

        // Verify cause exists
        const cause = await Cause.findById(causeId)
        if (!cause) {
            return res.status(404).json({ message: 'Cause not found' })
        }

        const donation = new Donation({
            donorId: donor._id,
            causeId,
            amount,
            paymentMethod,
            message,
            isAnonymous: Boolean(isAnonymous),
            status: 'completed' // For now, assuming immediate completion
        })

        await donation.save()

        // Update donor's total donations
        await Donor.findByIdAndUpdate(donor._id, {
            $inc: { totalDonations: amount }
        })

        // Update cause's current amount
        await Cause.findByIdAndUpdate(causeId, {
            $inc: { currentAmount: amount }
        })

        res.status(201).json({ message: 'Donation successful', donation })
    } catch (error) {
        console.error('Error creating donation:', error)
        res.status(500).json({ message: 'Error processing donation' })
    }
}

// Get donations by donor
donationCltr.getMyDonations = async (req, res) => {
    try {
        const donor = await Donor.findOne({ userId: req.user.userId })
        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' })
        }

        const donations = await Donation.find({ donorId: donor._id })
            .populate({
                path: 'causeId', 
                select: 'title description images currentAmount goalAmount status',
                populate: {
                    path: 'fundraiserId',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 })

        // Format donations to ensure consistent data structure
        const formattedDonations = donations.map(donation => {
            const donationObj = donation.toObject();
            
            // Make sure each cause has all the necessary fields
            if (donationObj.causeId) {
                // Ensure cause title exists
                if (!donationObj.causeId.title) {
                    donationObj.causeId.title = 'Untitled Cause';
                }
                
                // Ensure fundraiser name exists
                if (donationObj.causeId.fundraiserId && !donationObj.causeId.fundraiserId.name) {
                    donationObj.causeId.fundraiserId.name = 'Unknown Fundraiser';
                }
            }
            
            return donationObj;
        });

        res.json({
            donations: formattedDonations,
            stats: {
                totalDonations: donations.length,
                totalAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
                completedDonations: donations.filter(d => d.status === 'completed').length,
                pendingDonations: donations.filter(d => d.status === 'pending').length
            }
        })
    } catch (error) {
        console.error('Error fetching donations:', error)
        res.status(500).json({ message: 'Error fetching donations' })
    }
}

// Get recommended causes based on donor's previous donations
donationCltr.getRecommendedCauses = async (req, res) => {
    try {
        const donor = await Donor.findOne({ userId: req.user.userId })
        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' })
        }

        // Get categories from donor's previous donations
        const donations = await Donation.find({ donorId: donor._id })
            .populate('causeId', 'category')

        const categories = [...new Set(donations.map(d => d.causeId?.category).filter(Boolean))]

        // Find causes in similar categories, excluding already donated ones
        const donatedCauseIds = donations.map(d => d.causeId?._id)
        const recommendedCauses = await Cause.find({
            category: { $in: categories },
            _id: { $nin: donatedCauseIds },
            status: 'active'
        }).limit(5)

        res.json(recommendedCauses)
    } catch (error) {
        console.error('Error fetching recommended causes:', error)
        res.status(500).json({ message: 'Error fetching recommendations' })
    }
}

// Get donations by cause
donationCltr.getByCause = async (req, res) => {
    try {
        const { causeId } = req.params;
        console.log(`Fetching donations for cause: ${causeId}`);
        
        // Verify the cause exists
        const cause = await Cause.findById(causeId);
        if (!cause) {
            return res.status(404).json({ message: 'Cause not found' });
        }
        
        // Get donations for this cause with fully populated donor data
        // More detailed population to ensure we get donor names
        const donations = await Donation.find({ 
            causeId, 
            status: 'completed' 
        })
        .populate({
            path: 'donorId',
            // Include all donor fields
            select: '_id name email userId',
            // Deeply populate the userId to ensure we get the actual user object
            populate: {
                path: 'userId',
                select: '_id name email'
            }
        })
        .sort({ createdAt: -1 });

        console.log(`Found ${donations.length} donations for cause ${causeId}`);
        
        // Debug output to see what we're getting from the database
        if (donations.length > 0) {
            console.log('Raw donation data sample:', 
                JSON.stringify(donations.slice(0, 2).map(d => ({
                    id: d._id,
                    isAnonymous: d.isAnonymous,
                    donorId: d.donorId,
                    donorIdType: d.donorId ? typeof d.donorId : 'undefined',
                    hasUserId: d.donorId && d.donorId.userId ? 'yes' : 'no',
                    userIdType: d.donorId && d.donorId.userId ? typeof d.donorId.userId : 'undefined',
                    userName: d.donorId && d.donorId.userId && d.donorId.userId.name ? d.donorId.userId.name : null,
                    donorName: d.donorId && d.donorId.name ? d.donorId.name : null,
                    donorEmail: d.donorId && d.donorId.email ? d.donorId.email : null,
                    message: d.message || null,
                    amount: d.amount
                })), null, 2)
            );
        }
        
        // Format the donations to include proper donor information
        const formattedDonations = donations.map(donation => {
            const donationObj = donation.toObject();
            console.log(`Processing donation ${donation._id}, isAnonymous: ${donation.isAnonymous}, typeof isAnonymous: ${typeof donation.isAnonymous}`);
            
            // Handle anonymous donations - strict equality check for true
            if (donation.isAnonymous === true) {
                console.log(`Donation ${donation._id} is anonymous`);
                donationObj.donorName = 'Anonymous Donor';
                return donationObj;
            }
            
            // If no donorId, use a fallback but still try to get real data
            if (!donation.donorId) {
                console.log(`Donation ${donation._id} has no donorId`);
                // Try to get any name from the donation object itself if available
                donationObj.donorName = donation.donorName || 'Anonymous Donor';
                return donationObj;
            }
            
            // Primary source: userId.name (from User model)
            if (donation.donorId.userId && typeof donation.donorId.userId === 'object' && donation.donorId.userId.name) {
                console.log(`Donation ${donation._id} using userId.name: ${donation.donorId.userId.name}`);
                donationObj.donorName = donation.donorId.userId.name;
                return donationObj;
            }
            
            // Secondary source: donorId.name (from Donor model)
            if (donation.donorId.name && donation.donorId.name !== 'Donor') {
                console.log(`Donation ${donation._id} using donorId.name: ${donation.donorId.name}`);
                donationObj.donorName = donation.donorId.name;
                return donationObj;
            }
            
            // Fallback to email-based name
            if (donation.donorId.email) {
                const emailName = donation.donorId.email.split('@')[0];
                const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                console.log(`Donation ${donation._id} using email-based name: ${formattedName}`);
                donationObj.donorName = formattedName;
                return donationObj;
            }
            
            // Last resort - try to find any name within the donation object
            console.log(`Donation ${donation._id} - last resort, looking for any available name`);
            donationObj.donorName = donation.name || donation.donor || donation.userName || 'Anonymous Donor';
            return donationObj;
        });
        
        // Print a sample of what we're returning
        if (formattedDonations.length > 0) {
            console.log('Formatted donations sample:', JSON.stringify(formattedDonations.slice(0, 2).map(d => ({
                id: d._id,
                donorName: d.donorName,
                amount: d.amount,
                isAnonymous: d.isAnonymous,
                message: d.message || null
            })), null, 2));
        }
        
        res.json(formattedDonations);
    } catch (error) {
        console.error('Error fetching donations for cause:', error);
        res.status(500).json({ message: 'Error fetching donations' });
    }
}

export default donationCltr
