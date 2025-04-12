<<<<<<< HEAD
//core module
const path = require('path');

//External Modules
const express = require('express');

const careGiverController = require('./../controllers/careGiverController');

const careGiverRouter = express.Router();

// for admin site API's
careGiverRouter.post("/update-caregiver",careGiverController.updateCaregiverStatus);
careGiverRouter.post("/add-to-favourite",careGiverController.postAddToFavourite);
careGiverRouter.post("/reject-caregiver",careGiverController.rejectCaregiver);


// for frontend(App) site API's
careGiverRouter.post("/add-caregiver",careGiverController.postAddCareGiver);



careGiverRouter.post("/approved-caregivers-grouped",careGiverController.getApprovedCaregiversGrouped);
careGiverRouter.get("/caregivers-by-role/:role",careGiverController.getCaregiversByRole);



=======
//core module
const path = require('path');

//External Modules
const express = require('express');

const careGiverController = require('./../controllers/careGiverController');

const careGiverRouter = express.Router();

careGiverRouter.get("/",careGiverController.getCareGiver);

careGiverRouter.post("/add-caregiver",careGiverController.postAddCareGiver);

>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
module.exports = careGiverRouter;