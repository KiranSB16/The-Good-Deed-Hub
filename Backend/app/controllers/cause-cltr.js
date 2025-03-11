import Cause from "../models/cause-model.js";
import cloudinary from "../utils/cloudinary.js";
const causeCltr = {}
// import cloudinary from "cloudinary"

causeCltr.create = async (req, res) => {
  try {
    const { title, description, goalAmount, category, startDate, endDate } = req.body;
    
    console.log('Creating cause with data:', {
      title,
      description,
      goalAmount,
      category,
      startDate,
      endDate,
      fundraiserId: req.user.userId,
      userRole: req.user.role,
      status: 'pending'
    });
    
    const imageUploadPromises = req.files.images?.map((file) =>
      cloudinary.uploader.upload(file.path, { folder: "causes/images" })
    ) || [];
    
    const documentUploadPromises = req.files.documents?.map((file) =>
      cloudinary.uploader.upload(file.path, { 
        folder: "causes/documents", 
        resource_type: "raw" 
      })
    ) || [];
    
    // Resolve all the image and document uploads
    const imageResults = await Promise.all(imageUploadPromises);
    const documentResults = await Promise.all(documentUploadPromises);
    
    // Extract URLs of the uploaded files
    const imageUrls = imageResults.map((result) => result.secure_url);
    const documentUrls = documentResults.map((result) => result.secure_url);
    
    const causeData = {
      title,
      description,
      goalAmount,
      category,
      startDate,
      endDate,
      fundraiserId: req.user.userId,
      images: imageUrls,
      documents: documentUrls,
      status: 'pending', // Explicitly set status to pending
      isApproved: false // Set isApproved to false for new causes
    };
    
    console.log('Creating new cause with data:', JSON.stringify(causeData, null, 2));
    
    const newCause = new Cause(causeData);
    console.log('New cause object before save:', newCause.toObject());
    
    await newCause.save();
    
    // Populate the cause with related data
    await newCause.populate('category', 'name');
    await newCause.populate('fundraiserId', 'name email');
    
    console.log('Cause saved successfully:', {
      id: newCause._id,
      title: newCause.title,
      status: newCause.status,
      fundraiserId: newCause.fundraiserId?._id,
      category: newCause.category?.name
    });
    
    res.status(201).json({ 
      message: "Cause created successfully. Awaiting admin approval.", 
      cause: newCause 
    });
  } catch (error) {
    console.error('Error creating cause:', error);
    res.status(500).json({ 
      message: "Failed to create cause.", 
      error: error.message 
    });
  }
};

// Get all causes
causeCltr.list = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};

        console.log('List causes request:', {
            userRole: req.user.role,
            userId: req.user.userId,
            requestedStatus: status
        });

        // If user is a fundraiser, show all their causes
        if (req.user.role === 'fundraiser') {
            query.fundraiserId = req.user.userId;
            // Only apply status filter if specified
            if (status) {
                query.status = status;
            }
        }
        // If user is not an admin and not a fundraiser, only show approved causes
        else if (!req.user.role.includes('admin')) {
            query.status = 'approved';
        }
        // If status is specified in query and user is admin, filter by status
        else if (status) {
            query.status = status;
        }

        console.log('MongoDB query:', JSON.stringify(query, null, 2));

        const causes = await Cause.find(query)
            .populate('category', 'name')
            .populate('fundraiserId', 'name email')
            .lean();

        console.log('Query results:', {
            totalCauses: causes.length,
            statusBreakdown: causes.reduce((acc, cause) => {
                acc[cause.status] = (acc[cause.status] || 0) + 1;
                return acc;
            }, {}),
            causes: causes.map(c => ({
                id: c._id,
                title: c.title,
                status: c.status,
                fundraiserId: c.fundraiserId?._id
            }))
        });

        res.json(causes);
    } catch (error) {
        console.error('Error fetching causes:', error);
        res.status(500).json({ message: 'Error fetching causes' });
    }
};

causeCltr.show = async (req, res) => {
  try {
    const id = req.params.id;
    // Find the cause by ID and populate both fundraiser and category details
    const cause = await Cause.findById(id)
      .populate("fundraiserId", "name email")
      .populate("category", "name");
    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }
    res.status(200).json(cause);
  } catch (error) {
    console.error("Error Fetching Cause:", error.message); // Debug log
    res.status(500).json({ message: "Failed to fetch cause", error: error.message });
  }
};

causeCltr.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the cause to check permissions
    const cause = await Cause.findById(id);
    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }

    // Check if the cause is approved
    if (cause.status === 'approved') {
      return res.status(403).json({ message: "Cannot modify an approved cause" });
    }

    // Check if the user is authorized to update
    const isAdmin = req.user.role === "admin";
    const isFundraiserOwner = String(cause.fundraiserId) === String(req.user.userId);
    console.log('Update authorization check:', {
      isAdmin,
      isFundraiserOwner,
      causeFundraiserId: cause.fundraiserId,
      userId: req.user.userId
    });

    if (!isAdmin && !isFundraiserOwner) {
      return res.status(403).json({ message: "Unauthorized to update this cause" });
    }

    // Merge existing cause data with the request body
    const updatedData = {
      title: req.body.title || cause.title,
      description: req.body.description || cause.description,
      goalAmount: req.body.goalAmount || cause.goalAmount,
      category: req.body.category || cause.category,
      startDate: req.body.startDate || cause.startDate,
      endDate: req.body.endDate || cause.endDate,
    };

    // Handle status updates
    if (req.body.status === 'pending' && cause.status === 'rejected') {
      updatedData.status = 'pending';
      updatedData.rejectionReason = null; // Clear rejection reason when resubmitting
    }

    console.log('Updating cause with data:', updatedData);

    // Update the cause
    const updatedCause = await Cause.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name').populate('fundraiserId', 'name email');

    res.status(200).json({ 
      message: updatedData.status === 'pending' ? "Cause resubmitted successfully" : "Cause updated successfully", 
      cause: updatedCause 
    });
  } catch (error) {
    console.error("Error Updating Cause:", error.message);
    res.status(500).json({ message: "Failed to update cause", error: error.message });
  }
};


causeCltr.delete = async (req, res) => {
  try {
    const id = req.params.id;
    // Fetch the cause to check permissions
    const cause = await Cause.findById(id);
    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }

    // Check if the cause is approved
    if (cause.status === 'approved') {
      return res.status(403).json({ message: "Cannot delete an approved cause" });
    }

    // Check if the user is authorized to delete
    const isAdmin = req.user.role === "admin";
    const isFundraiserOwner = String(cause.fundraiserId) === String(req.user.userId);
    console.log('Delete authorization check:', {
      isAdmin,
      isFundraiserOwner,
      causeFundraiserId: cause.fundraiserId,
      userId: req.user.userId
    });

    if (!isAdmin && !isFundraiserOwner) {
      return res.status(403).json({ message: "Unauthorized to delete this cause" });
    }

    // Use findByIdAndDelete to delete the cause
    const deletedCause = await Cause.findByIdAndDelete(id);
    console.log("Deleted Cause:", deletedCause);
    res.status(200).json({ message: "Cause deleted successfully", cause: deletedCause });
  } catch (error) {
    console.error("Error Deleting Cause:", error.message);
    res.status(500).json({ message: "Failed to delete cause", error: error.message });
  }
};

causeCltr.approve = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the cause
    const cause = await Cause.findById(id);
    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }

    // Update status to approved
    cause.status = 'approved';
    await cause.save();

    // Populate the cause with related data
    await cause.populate('category', 'name');
    await cause.populate('fundraiserId', 'name email');

    res.status(200).json({
      message: "Cause approved successfully",
      cause: cause
    });
  } catch (error) {
    console.error("Error Approving Cause:", error.message);
    res.status(500).json({ message: "Failed to approve cause", error: error.message });
  }
};

causeCltr.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    // Find the cause
    const cause = await Cause.findById(id);
    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }

    // Update status to rejected and add reason
    cause.status = 'rejected';
    cause.rejectionReason = reason;
    await cause.save();

    // Populate the cause with related data
    await cause.populate('category', 'name');
    await cause.populate('fundraiserId', 'name email');

    res.status(200).json({
      message: "Cause rejected successfully",
      cause: cause
    });
  } catch (error) {
    console.error("Error Rejecting Cause:", error.message);
    res.status(500).json({ message: "Failed to reject cause", error: error.message });
  }
};

export default causeCltr