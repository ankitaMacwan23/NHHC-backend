const { check, validationResult } = require('express-validator');
const Patient = require('./../models/patient');
const Caregivers = require('./../models/careGiver');


const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//--------------------for admin site functions--------------------------------------

exports.postAddToFavourite = async (req, res) => {
  try {
    const { caregiverId } = req.body;
    await Caregivers.findByIdAndUpdate(caregiverId, { isFavourite: true });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error add to favourite mark:", err);
    res.status(500).json({ error: "Failed to add as add to favourite" });
  }
};

//update caregiver status approve or reject from admin
exports.updateCaregiverStatus = async (req, res) => {
  try {
    const { caregiverId, status } = req.body;

    if (!caregiverId || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    await Caregivers.findByIdAndUpdate(caregiverId, { status });

    res.status(200).json({ message: `Caregiver status updated to ${status}` });
  } catch (error) {
    console.error("Error updating caregiver status:", error);
    res.status(500).json({ error: "Failed to update caregiver status" });
  }
};

exports.rejectCaregiver = async (req, res) => {
  try {
    const { caregiverId } = req.body;
    await Caregivers.findByIdAndUpdate(caregiverId, { status: "Rejected" });
    res.status(200).json({ message: "Caregiver rejected" });
  } catch (err) {
    console.error("Error rejecting caregiver:", err);
    res.status(500).json({ error: "Failed to reject caregiver" });
  }
};

//--------------------------for frontend(App) Functions------------------------------
exports.postAddCareGiver = async (req, res) => {
  try {
    const {
      caregiver_name,
      caregiver_gender,
      caregiver_dob,
      caregiver_contact,
      caregiver_email,
      caregiver_address,
      caregiver_role,
    } = req.body;

    // Validate required fields
    if (
      !caregiver_name ||
      !caregiver_gender ||
      !caregiver_dob ||
      !caregiver_contact ||
      !caregiver_email ||
      !caregiver_address ||
      !caregiver_role
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let aadharUrl = null;
    let certificateUrl = null;

    // Upload Aadhar
    if (req.files?.aadhar) {
      const uploadAadhar = await cloudinary.uploader.upload_stream(
        { folder: "nhhc/caregivers" },
        (error, result) => {
          if (error) console.error(error);
        }
      );

      const buffer = req.files.aadhar[0].buffer;
      aadharUrl = await new Promise((resolve) => {
        cloudinary.uploader.upload_stream(
          { folder: "nhhc/caregivers" },
          (err, result) => resolve(result.secure_url)
        ).end(buffer);
      });
    }

    // Upload Certificate
    if (req.files?.certificate) {
      const buffer = req.files.certificate[0].buffer;
      certificateUrl = await new Promise((resolve) => {
        cloudinary.uploader.upload_stream(
          { folder: "nhhc/caregivers" },
          (err, result) => resolve(result.secure_url)
        ).end(buffer);
      });
    }

    // Create caregiver
    const newCareGiver = new Caregivers({
      name: caregiver_name,
      gender: caregiver_gender,
      dob: caregiver_dob,
      contact: caregiver_contact,
      email: caregiver_email,
      address: caregiver_address,
      role: caregiver_role,

      aadhar_url: aadharUrl,
      certificate_url: certificateUrl,
    });

    const savedCareGiver = await newCareGiver.save();

    res.status(201).json({
      message: "Caregiver added successfully",
      caregiver: savedCareGiver,
    });
  } catch (error) {
    console.error("Error saving caregiver:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};








exports.getApprovedCaregiversGrouped = async (req, res) => {
  try {
    const caregivers = await Caregivers.aggregate([
      { $match: { status: "Approved" } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json({ caregivers });
  } catch (err) {
    console.error("Error grouping caregivers:", err);
    res.status(500).json({ error: "Failed to fetch grouped caregivers" });
  }
};

exports.getCaregiversByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const caregivers = await Caregivers.find({ role, status: "Approved" });
    res.status(200).json({ caregivers });
  } catch (err) {
    console.error("Error fetching caregivers:", err);
    res.status(500).json({ error: "Failed to fetch caregivers" });
  }
};