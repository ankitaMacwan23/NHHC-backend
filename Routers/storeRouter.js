//core module
const path = require('path');

//External Modules
const express = require('express');

const storeController = require('./../controllers/storeController');

const storeRouter = express.Router();

storeRouter.get("/",storeController.getIndex);

storeRouter.get("/services",storeController.getServices);

module.exports = storeRouter;