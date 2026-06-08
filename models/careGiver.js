const mongoose = require("mongoose");

const caregiverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dob: { type: Date, required: true },
  contact: { type: String, required: true, match: /^[0-9]{10}$/ },
  // Email is OPTIONAL. Only validate the format when a value is actually provided
  // (an empty string is normalised to undefined in the controller before saving).
  email: {
    type: String,
    validate: {
      validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email address',
    },
  },
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
