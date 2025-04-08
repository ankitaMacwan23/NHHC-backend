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
  }
});

module.exports = mongoose.model('PatientToCaregiver', patientToCaregiverSchema);



//output look like 
/* {
  "patientId": "P001",
  "caregiverId": "C001",
  "caregiverRole": "Nurse",
  "date": "2025-04-09T00:00:00.000Z",
  "duty": "Morning",
  "verificationCode": "128394",
  "status": "service_pending"
}
{
  "patientId": "P001",
  "caregiverId": "C002",
  "caregiverRole": "Doctor",
  "date": "2025-04-09T00:00:00.000Z",
  "duty": "Morning",
  "verificationCode": "740215",
  "status": "service_pending"
}
 */