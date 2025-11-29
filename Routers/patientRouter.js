//core module
const path = require('path');

//External Modules
const express = require('express');
const upload = require("./../middleware/uploadPatientDocument");

const patientController = require('./../controllers/patientController');

const patientRouter = express.Router();

// for admin site API's
patientRouter.post("/detail-patient", patientController.getPatientDetails);
patientRouter.post('/payment-info/', patientController.postPaymentInfo);
patientRouter.post("/reject-patient/:patientId", patientController.rejectPatient);
patientRouter.post('/submit-payment', patientController.submitPatientPayment);
patientRouter.post("/assigned-caregivers", patientController.getAssignedCaregivers);
patientRouter.post("/assign-caregiver", patientController.postAssignCaregiver);

// for frontend(App) site API's
patientRouter.post("/add-patient", upload.single("document"), patientController.postAddPatient);
patientRouter.post("/assigned-patients", patientController.getAssignedPatientToCareGiver);
patientRouter.post("/completed-patients", patientController.getCompletedAssignedPatients);
patientRouter.post("/verified_code", patientController.verifyPatientCode);

exports.patientRouter = patientRouter;
