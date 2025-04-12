//core module
const path = require('path');

//External Modules
const express = require('express');

const authController = require('./../controllers/authController');

const authRouter = express.Router();

// for admin site API's
authRouter.post("/admin/login",authController.getAdminLogin);
authRouter.get("/admin/logout",authController.getAdminLogout);
authRouter.get("/admin/check-session", authController.getCheckAdminSession);

// for frontend(App) site API's
authRouter.post("/login/caregiver", authController.postLogin);
authRouter.post('/user/save-mobile', authController.postSaveMobile);






authRouter.post("/login/verify-otp", authController.postVerifyOtp);
authRouter.post("/logout",authController.postLogout);








module.exports = authRouter;