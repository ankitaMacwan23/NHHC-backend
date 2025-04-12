<<<<<<< HEAD
//core module
const path = require('path');

//External Modules
const express = require('express');

const adminController = require('./../controllers/adminController');

const adminRouter = express.Router();

// for admin site API's
adminRouter.get("/patients",adminController.getAllPatients);
adminRouter.get("/caregivers",adminController.getAllCareGivers);

// for frontend(App) site API's

=======
//core module
const path = require('path');

//External Modules
const express = require('express');

const adminController = require('./../controllers/adminController');

const adminRouter = express.Router();

adminRouter.get("/",adminController.getAdminPage);
adminRouter.get("/patients/",adminController.getPatients);
adminRouter.get("/caregivers",adminController.getCareGivers);

adminRouter.get("/caregivers/nurse",adminController.getNurses);
adminRouter.get("/caregivers/doctor",adminController.getDoctors);
adminRouter.get("/caregivers/physio",adminController.getPhysios);
adminRouter.get("/caregivers/cleaner",adminController.getCleaners);

// New route to approve a care givers
adminRouter.post("/caregivers/doctor/:id/approve", adminController.postApproveDoctor);
adminRouter.post("/caregivers/nurse/:id/approve", adminController.postApproveNurse);
adminRouter.post("/caregivers/physio/:id/approve", adminController.postApprovePhysio);
adminRouter.post("/caregivers/cleaner/:id/approve", adminController.postApproveCleaner);


>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
module.exports = adminRouter;