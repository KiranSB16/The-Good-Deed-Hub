import Cause from "../models/cause-model.js";
import cloudinary from "../utils/cloudinary.js";
import Donation from "../models/donation-model.js";
import Category from "../models/category-model.js";
const causeCltr = {}
// import cloudinary from "cloudinary"

// List Causes with Search, Filter, Sort, Pagination
causeCltr.list = async (req, res) => {
    try {
        let { search = "", category = "", sort = "newest", page = 1, limit = 10, status } = req.query;

        // Convert page and limit to numbers with validation
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const skip = (page - 1) * limit;

        // Build Query Object
        let query = {};

        if (req.user.role === "donor") {
            query.status = "approved"; // Donors can only see approved causes
        } else if (req.user.role === "fundraiser") {
            query.fundraiserId = req.user.userId; // Fundraisers see only their own causes
            if (status) query.status = status; // Optional status filter
        } else if (req.user.role === "admin" && status) {
            query.status = status; // Admin can filter by status
        }

        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }
        if (category) {
            // Find the category by name and use its ID
            const categoryDoc = await Category.findOne({ name: category });
            if (categoryDoc) {
                query.category = categoryDoc._id;
            }
        }

        // Sorting Logic
        let sortOption = { createdAt: -1 }; // Default: Newest
        switch (sort) {
            case "oldest":
                sortOption = { createdAt: 1 };
                break;
            case "highest":
                sortOption = { currentAmount: -1 };
                break;
            case "lowest":
                sortOption = { currentAmount: 1 };
                break;
            default:
                sortOption = { createdAt: -1 }; // Newest
        }

        // Fetch Causes with population
        const causes = await Cause.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate('category', 'name')
            .populate('fundraiserId', 'name email')
            .lean();

        // Count Total Causes (for pagination)
        const total = await Cause.countDocuments(query);

        res.json({
            causes,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            limit
        });
    } catch (error) {
        console.error('Error listing causes:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get a Single Cause by ID
causeCltr.show = async (req, res) => {
    try {
        const cause = await Cause.findById(req.params.id)
            .populate('category', 'name')
            .populate('fundraiserId', 'name email');

        if (!cause) {
            return res.status(404).json({ message: "Cause not found" });
        }

        // Donors should only see approved causes
        if (req.user.role === "donor" && cause.status !== "approved") {
            return res.status(403).json({ message: "Unauthorized to view this cause" });
        }

        res.json(cause);
    } catch (error) {
        console.error('Error fetching cause:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Create a Cause (Fundraisers Only)
causeCltr.create = async (req, res) => {
    try {
        if (req.user.role !== "fundraiser") {
            return res.status(403).json({ message: "Only fundraisers can create causes" });
        }

        // Handle image uploads
        const imageUploadPromises = req.files?.images?.map((file) =>
            cloudinary.uploader.upload(file.path, { folder: "causes/images" })
        ) || [];

        // Handle document uploads
        const documentUploadPromises = req.files?.documents?.map((file) =>
            cloudinary.uploader.upload(file.path, { 
                folder: "causes/documents", 
                resource_type: "raw" 
            })
        ) || [];

        // Resolve all uploads
        const [imageResults, documentResults] = await Promise.all([
            Promise.all(imageUploadPromises),
            Promise.all(documentUploadPromises)
        ]);

        // Extract URLs
        const imageUrls = imageResults.map(result => result.secure_url);
        const documentUrls = documentResults.map(result => result.secure_url);

        const newCause = new Cause({
            title: req.body.title,
            description: req.body.description,
            goalAmount: req.body.goalAmount,
            category: req.body.category,
            fundraiserId: req.user.userId,
            images: imageUrls,
            documents: documentUrls,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            status: "pending",
            isApproved: false
        });

        await newCause.save();
        
        // Populate the cause with related data
        await newCause.populate('category', 'name');
        await newCause.populate('fundraiserId', 'name email');

        res.status(201).json({ 
            message: "Cause created successfully. Awaiting admin approval.", 
            cause: newCause 
        });
    } catch (error) {
        console.error('Error creating cause:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update a Cause (Fundraiser Only)
causeCltr.update = async (req, res) => {
    try {
        const cause = await Cause.findById(req.params.id);
        if (!cause) {
            return res.status(404).json({ message: "Cause not found" });
        }

        // Check if the cause is approved
        if (cause.status === 'approved') {
            return res.status(403).json({ message: "Cannot modify an approved cause" });
        }

        // Check authorization
        if (cause.fundraiserId.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to update this cause" });
        }

        // Handle image uploads if new images are provided
        if (req.files?.images) {
            const imageUploadPromises = req.files.images.map((file) =>
                cloudinary.uploader.upload(file.path, { folder: "causes/images" })
            );
            const imageResults = await Promise.all(imageUploadPromises);
            req.body.images = imageResults.map(result => result.secure_url);
        }

        // Handle document uploads if new documents are provided
        if (req.files?.documents) {
            const documentUploadPromises = req.files.documents.map((file) =>
                cloudinary.uploader.upload(file.path, { 
                    folder: "causes/documents", 
                    resource_type: "raw" 
                })
            );
            const documentResults = await Promise.all(documentUploadPromises);
            req.body.documents = documentResults.map(result => result.secure_url);
        }

        // Update the cause
        Object.assign(cause, req.body);
        await cause.save();

        // Populate the updated cause
        await cause.populate('category', 'name');
        await cause.populate('fundraiserId', 'name email');

        res.json({ 
            message: "Cause updated successfully", 
            cause 
        });
    } catch (error) {
        console.error('Error updating cause:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete a Cause (Fundraiser Only)
causeCltr.delete = async (req, res) => {
    try {
        const cause = await Cause.findById(req.params.id);
        if (!cause) {
            return res.status(404).json({ message: "Cause not found" });
        }

        // Check if the cause is approved
        if (cause.status === 'approved') {
            return res.status(403).json({ message: "Cannot delete an approved cause" });
        }

        // Check authorization
        if (cause.fundraiserId.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to delete this cause" });
        }

        await cause.deleteOne();
        res.json({ message: "Cause deleted successfully" });
    } catch (error) {
        console.error('Error deleting cause:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Admin Approves or Rejects a Cause
causeCltr.updateStatus = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can update status" });
        }

        const cause = await Cause.findById(req.params.id);
        if (!cause) {
            return res.status(404).json({ message: "Cause not found" });
        }

        cause.status = req.body.status; // "approved" or "rejected"
        if (req.body.rejectionReason) {
            cause.rejectionReason = req.body.rejectionReason;
        }
        cause.isApproved = req.body.status === "approved";
        
        await cause.save();

        // Populate the updated cause
        await cause.populate('category', 'name');
        await cause.populate('fundraiserId', 'name email');

        res.json({ 
            message: `Cause ${cause.status} successfully`, 
            cause 
        });
    } catch (error) {
        console.error('Error updating cause status:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get donations for a specific cause
causeCltr.getDonations = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find all donations for this cause with populated donor information
        const donations = await Donation.find({ causeId: id })
            .populate({
                path: 'donorId',
                select: 'name email profileImage',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });

        // Map the donations to include proper donor information
        const formattedDonations = donations.map(donation => ({
            _id: donation._id,
            amount: donation.amount,
            message: donation.message,
            createdAt: donation.createdAt,
            donorId: {
                _id: donation.donorId?._id,
                name: donation.donorId?.userId?.name || donation.donorId?.name || 'Anonymous',
                email: donation.donorId?.userId?.email || donation.donorId?.email,
                profileImage: donation.donorId?.profileImage
            }
        }));
        
        res.json(formattedDonations);
    } catch (error) {
        console.error('Error fetching cause donations:', error);
        res.status(500).json({ message: 'Error fetching donations' });
    }
};

export default causeCltr