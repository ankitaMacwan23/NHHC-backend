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




