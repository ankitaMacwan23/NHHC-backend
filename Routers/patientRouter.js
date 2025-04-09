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
