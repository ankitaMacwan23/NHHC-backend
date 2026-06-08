const { check, validationResult } = require('express-validator');
const Patient = require('./../models/patient');
const Caregivers = require('./../models/careGiver');
const { sendSms } = require('../services/sms');


const cloudinary = require("cloudinary").v2;

// Builds the approval/rejection message sent to a caregiver after an admin
// decision. Centralised so the wording stays consistent across endpoints.
const caregiverStatusMessage = (status, name) => {
  const hi = name ? `Hi ${name}, ` : '';
  if (status === 'Approved') {
    return `${hi}congratulations! Your Naysan Home Health Care caregiver registration has been approved. You can now log in to the app.`;
  }
  return `${hi}we're sorry to inform you that your Naysan Home Health Care caregiver registration has been rejected. Please contact support for details.`;
};

// Best-effort notification to a caregiver about an approve/reject decision.
// Never throws — a failed SMS must not fail the admin action.
const notifyCaregiverStatus = async (caregiver, status) => {
  try {
    if (!caregiver || !caregiver.contact) return;
    await sendSms(caregiver.contact, caregiverStatusMessage(status, caregiver.name));
  } catch (err) {
    console.error('Failed to send caregiver status notification:', err.message || err);
  }
};

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

    const caregiver = await Caregivers.findByIdAndUpdate(
      caregiverId,
      { status },
      { new: true }
    );

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    // Notify the caregiver of the decision (non-blocking, best-effort).
    await notifyCaregiverStatus(caregiver, status);

    res.status(200).json({ message: `Caregiver status updated to ${status}` });
  } catch (error) {
    console.error("Error updating caregiver status:", error);
    res.status(500).json({ error: "Failed to update caregiver status" });
  }
};

exports.rejectCaregiver = async (req, res) => {
  try {
    const { caregiverId } = req.body;
    const caregiver = await Caregivers.findByIdAndUpdate(
      caregiverId,
      { status: "Rejected" },
      { new: true }
    );

    if (!caregiver) {
      return res.status(404).json({ error: "Caregiver not found" });
    }

    await notifyCaregiverStatus(caregiver, "Rejected");

    res.status(200).json({ message: "Caregiver rejected" });
  } catch (err) {
    console.error("Error rejecting caregiver:", err);
    res.status(500).json({ error: "Failed to reject caregiver" });
  }
};

//--------------------------for frontend(App) Functions------------------------------

// helper: upload one file buffer to cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image", // we’re uploading images from app
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};

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

    // Basic validation — email is OPTIONAL, everything else required.
    if (
      !caregiver_name ||
      !caregiver_gender ||
      !caregiver_dob ||
      !caregiver_contact ||
      !caregiver_address ||
      !caregiver_role
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(caregiver_contact)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    // Email optional — validate the format only when one is supplied.
    const normalizedEmail =
      caregiver_email && caregiver_email.trim() ? caregiver_email.trim() : undefined;
    if (normalizedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address",
        });
      }
    }

    // 🔹 Files from Multer
    const aadharFile =
      req.files && req.files.aadhar_document && req.files.aadhar_document[0];
    const certificateFile =
      req.files &&
      req.files.certificate_document &&
      req.files.certificate_document[0];

    // Documents are MANDATORY.
    if (!aadharFile || !certificateFile) {
      return res.status(400).json({
        success: false,
        message: "Aadhar card and certificate documents are both required.",
      });
    }

    let aadharUrl = null;
    let certificateUrl = null;

    // 🔹 Upload to Cloudinary (if file present)
    if (aadharFile) {
      aadharUrl = await uploadToCloudinary(
        aadharFile.buffer,
        "nhhc/caregivers/aadhar"
      );
    }
    if (certificateFile) {
      certificateUrl = await uploadToCloudinary(
        certificateFile.buffer,
        "nhhc/caregivers/certificates"
      );
    }

    const newCareGiver = new Caregivers({
      name: caregiver_name,
      gender: caregiver_gender,
      dob: caregiver_dob,
      contact: caregiver_contact,
      email: normalizedEmail,
      address: caregiver_address,
      role: caregiver_role,
      aadhar_document: aadharUrl,
      certificate_document: certificateUrl,
    });

    const savedCareGiver = await newCareGiver.save();

    res.status(201).json({
      success: true,
      message: "Caregiver added successfully",
      caregiver: savedCareGiver,
    });
  } catch (error) {
    console.error("Error saving care giver:", error);

    // Multer field-name errors will show up here too
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || String(error),
    });
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