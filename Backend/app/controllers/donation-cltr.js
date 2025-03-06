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

        const { causeId, amount, paymentMethod, message } = req.body

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
            status: 'completed' // For now, assuming immediate completion
        })

        await donation.save()

        // Update donor's total donations
        await Donor.findByIdAndUpdate(donor._id, {
            $inc: { totalDonations: amount }
        })

        // Update cause's raised amount
        await Cause.findByIdAndUpdate(causeId, {
            $inc: { raisedAmount: amount }
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
            .populate('causeId', 'title description')
            .sort({ createdAt: -1 })

        res.json(donations)
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

export default donationCltr
