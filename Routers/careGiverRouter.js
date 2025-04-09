//core module
const path = require('path');

//External Modules
const express = require('express');

const careGiverController = require('./../controllers/careGiverController');

const careGiverRouter = express.Router();

careGiverRouter.get("/",careGiverController.getCareGiver);

careGiverRouter.post("/add-caregiver",careGiverController.postAddCareGiver);

module.exports = careGiverRouter;