const mongoose = require('mongoose');

const patientToCaregiverSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregivers',
    required: true,
  },
  caregiverRole: {
    type: String,
    enum: ['Doctor', 'Nurse', 'Physio', 'Cleaner'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duty: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['service_pending', 'service_completed'],
    default: 'service_pending',
  },
  payment_to_caregiver: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending',
  },
  payment_from_patient: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending',
  },
  charges: [
    {
      charge: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      },
      discount: {
        type: Number,
        default: 0
      },
      extraCharges: {
        type: Number,
        default: 0
      },
      finalTotal: {
        type: Number,
        default: 0
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model('PatientToCaregiver', patientToCaregiverSchema);
