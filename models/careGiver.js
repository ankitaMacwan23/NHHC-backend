const mongoose = require("mongoose");

const caregiverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dob: { type: Date, required: true },
  contact: { type: String, required: true, match: /^[0-9]{10}$/ },
  email: { type: String, required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  address: { type: String, required: true },
  role: { type: String, enum: ["Nurse", "Doctor", "Physio", "Cleaner"], required: true },

  // 📌 NEW: Cloudinary URLs
  aadhar_document: { type: String },
certificate_document: { type: String },


  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "PaymentDone"],
    default: "Pending"
  },

  isFavourite: { type: Boolean, default: false }
});

module.exports = mongoose.model("Caregivers", caregiverSchema);
