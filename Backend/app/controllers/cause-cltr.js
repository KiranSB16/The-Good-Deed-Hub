import Cause from "../models/cause-model.js";
import cloudinary from "../utils/cloudinary.js";
const causeCltr = {}
// import cloudinary from "cloudinary"

causeCltr.create = async (req, res) => {
  try {
    const { title, description, goalAmount, category, startDate, endDate } = req.body;
    
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
    
    const newCause = new Cause({
      title,
      description,
      goalAmount,
      category,
      startDate,
      endDate,
      fundraiserId: req.user.userId,
      images: imageUrls,
      documents: documentUrls,
    });
    
    await newCause.save();
    res.status(201).json({ 
      message: "Cause created successfully. Awaiting admin approval.", 
      cause: newCause 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to create cause.", 
      error: error.message 
    });
  }
};

causeCltr.list = async (req, res) => {
  try {
    // Fetch causes and populate fundraiser details
    const causes = await Cause.find().populate("fundraiserId", "name email");

    // // Format the response with serial numbers
    // const response = causes.map((cause) => ({
    //   id: cause._id,
    //   title: cause.title,
    //   description: cause.description,
    //   goalAmount: cause.goalAmount,
    //   currentAmount: cause.currentAmount,
    //   category: cause.category,
    //   fundraiserId: cause.fundraiserId?._id || null, // Include fundraiser ID
    //   fundraiserName: cause.fundraiserId?.name || "Unknown", // Include fundraiser name
    //   fundraiserEmail: cause.fundraiserId?.email || "Unknown", // Include fundraiser email
    //   status: cause.status,
    //   startDate: cause.startDate,
    //   endDate: cause.endDate,
    //   createdAt: cause.createdAt,
    //   updatedAt: cause.updatedAt,
    // }));

    res.status(200).json(causes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch causes", error: error.message });
  }
};

causeCltr.show = async (req, res) => {
  try {
    const id = req.params.id;
    // Find the cause by ID and populate fundraiser details
    const cause = await Cause.findById(id).populate("fundraiserId", "name email");
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

    // Check if the user is authorized to update
    const isAdmin = req.user.role === "admin";
    const isFundraiserOwner = String(cause.fundraiserId) === req.user.userId;
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

    // Update the cause
    const updatedCause = await Cause.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Cause updated successfully", cause: updatedCause });
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
    // Check if the user is authorized to delete
    if (req.user.role !== "admin" && String(cause.fundraiserId) !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this cause" });
    }
    // Use findByIdAndDelete to delete the cause
    const deletedCause = await Cause.findByIdAndDelete(id);
    // If needed, log or handle the deleted document
    console.log("Deleted Cause:", deletedCause);
    res.status(200).json({ message: "Cause deleted successfully", cause: deletedCause });
  } catch (error) {
    console.error("Error Deleting Cause:", error.message); // Debug log
    res.status(500).json({ message: "Failed to delete cause", error: error.message });
  }
};



export default causeCltr