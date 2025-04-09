//core module
const path = require('path');

//External Modules
const express = require('express');

const authController = require('./../controllers/authController');

const authRouter = express.Router();

authRouter.get("/login",authController.getLogin);

authRouter.post("/login/caregiver", authController.postLogin);

authRouter.post("/login/verify-otp", authController.postVerifyOtp);

authRouter.post("/logout",authController.postLogout);

authRouter.post('/user/save-mobile', authController.postSaveMobile);



module.exports = authRouter;