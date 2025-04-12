const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientGender: { type: String, required: true },
  patientAge: { type: String, required: true },
  patientContact: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientAddress: { type: String, required: true },
  medicationPhotoUrl: {},
  status: {
    type: String,
<<<<<<< HEAD
    enum: ['Pending', 'Approved','Rejected','PaymentDone'],
=======
    enum: ['Pending', 'Approved'],
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
    default: 'Pending'
  }
});

// Add geospatial index
patientSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Patient", patientSchema);
