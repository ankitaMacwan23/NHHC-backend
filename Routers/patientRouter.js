<<<<<<< HEAD
//core module
const path = require('path');

//External Modules
const express = require('express');

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
patientRouter.post("/add-patient", patientController.postAddPatient);
patientRouter.post("/assigned-patients", patientController.getAssignedPatientToCareGiver);
patientRouter.post("/completed-patients", patientController.getCompletedAssignedPatients);
patientRouter.post("/verified_code", patientController.verifyPatientCode);

exports.patientRouter = patientRouter;
=======
//core module
const path = require('path');

//External Modules
const express = require('express');

const patientController = require('./../controllers/patientController');

const patientRouter = express.Router();

patientRouter.get("/add-patient", patientController.getAddPatient);

patientRouter.post("/add-patient", patientController.postAddPatient);

patientRouter.get("/detail-patient/:patientId", patientController.getPatientDetails);

patientRouter.get("/edit-patient/:patientId", patientController.getEditPatient);

patientRouter.post("/edit-patient", patientController.postEditPatient);

patientRouter.post("/delete-patient/:patientId", patientController.postDeletePatient);

patientRouter.post("/assign-caregiver", patientController.postAssignCaregiver );

patientRouter.post("/assigned-patients", patientController.getAssignedPatientToCareGiver);
patientRouter.post("/verified_code", patientController.verifyPatientCode);

patientRouter.post("/completed-patients", patientController.getCompletedAssignedPatients);

exports.patientRouter = patientRouter;
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
