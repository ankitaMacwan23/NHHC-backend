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

module.exports = adminRouter;