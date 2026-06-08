const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientGender: { type: String, required: true },
  patientAge: { type: String, required: true },
  patientContact: { type: String, required: true },
  patientEmail: { type: String }, // optional
  patientAddress: { type: String, required: true },
  document: { type: String, default: null },
  medicationPhotoUrl: {},
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'PaymentDone'],
    default: 'Pending'
  },
  // Snapshot of the final payment breakdown, saved when the admin generates the bill.
  paymentSummary: {
    baseAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    extraCharges: { type: Number, default: 0 },
    finalTotal: { type: Number, default: 0 },
    paidAt: { type: Date },
  },
}, { timestamps: true });


// Add geospatial index
patientSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Patient", patientSchema);
