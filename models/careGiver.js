const mongoose = require("mongoose");

const caregiverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dob: { type: Date, required: true },
    contact: { type: String, required: true, match: /^[0-9]{10}$/ }, // Ensures 10-digit number
    email: { type: String, required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }, // Ensures valid email
    address: { type: String, required: true },
    role: { type: String, enum: ["Nurse", "Doctor", "Physio", "Cleaner"], required: true },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected",'PaymentDone'],
        default: "Pending"
      },
      isFavourite: {
        type: Boolean,
        default: false
      }
    //document: { type: String, required: true }, // Path to uploaded document
    //aadhar_document: { type: String, required: true }, // Path to Aadhar upload
});

module.exports = mongoose.model("Caregivers", caregiverSchema);
