<<<<<<< HEAD
const { check, validationResult } = require('express-validator');
const Patient = require('./../models/patient');
const Caregivers = require('./../models/careGiver');

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
exports.postAddCareGiver = async (req, res, next) => {
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

    // Basic validation
    if (
      !caregiver_name ||
      !caregiver_gender ||
      !caregiver_dob ||
      !caregiver_contact ||
      !caregiver_email ||
      !caregiver_address ||
      !caregiver_role
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Optional: validate contact number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(caregiver_contact)) {
      return res.status(400).json({
        message: "Contact number must be a 10-digit number",
      });
    }

    // Optional: validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(caregiver_email)) {
      return res.status(400).json({
        message: "Invalid email address",
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
    });

    const savedCareGiver = await newCareGiver.save();

    res.status(201).json({
      message: "Care Giver added successfully",
      caregiver: savedCareGiver,
    });
  } catch (error) {
    console.error("Error saving care giver:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message || error,
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
=======
const { check, validationResult } = require('express-validator');
const Patient = require('./../models/patient');
const Caregivers = require('./../models/careGiver');

//to get add caregiver form
exports.getCareGiver = (req,res,next) => {
  res.render('caregiver/edit-caregiver',{editing : false,
    errors: [],
    oldInput: {caregiver_name: "", caregiver_gender: "", caregiver_dob: "", caregiver_contact: "", caregiver_email: "", caregiver_address: "", caregiver_role: ""},
    pageTitle: 'Add Care Giver'});
}

exports.postAddCareGiver = async (req, res, next) => {
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

    // Basic validation
    if (
      !caregiver_name ||
      !caregiver_gender ||
      !caregiver_dob ||
      !caregiver_contact ||
      !caregiver_email ||
      !caregiver_address ||
      !caregiver_role
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Optional: validate contact number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(caregiver_contact)) {
      return res.status(400).json({
        message: "Contact number must be a 10-digit number",
      });
    }

    // Optional: validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(caregiver_email)) {
      return res.status(400).json({
        message: "Invalid email address",
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
    });

    const savedCareGiver = await newCareGiver.save();

    res.status(201).json({
      message: "Care Giver added successfully",
      caregiver: savedCareGiver,
    });
  } catch (error) {
    console.error("Error saving care giver:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message || error,
    });
  }
};




>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
