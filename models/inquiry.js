const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
    email: { type: String }, // optional
    subject: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['Unsolved', 'Solved'],
      default: 'Unsolved',
    },
  },
  { timestamps: true } // createdAt / updatedAt — used for newest-first ordering
);

module.exports = mongoose.model('Inquiry', inquirySchema);
