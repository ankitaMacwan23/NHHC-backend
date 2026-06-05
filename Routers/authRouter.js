const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('./../controllers/authController');
const otpAuth = require('./../controllers/otpAuthController');
const requireAuth = require('./../middleware/requireAuth');

const authRouter = express.Router();

// --- Rate limiters (brute-force protection) ---------------------------------
// Per-IP guard on OTP issuance/verification, layered on top of the per-phone
// cooldown + attempt counter enforced in the controller.
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5, // 5 OTP requests / IP / window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many code requests. Please try again later.' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20, // verify attempts / IP / window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

// =========================== App (mobile) auth ===============================
// New token-based, server-authoritative OTP flow.
authRouter.post('/otp/request', otpRequestLimiter, otpAuth.requestOtp);
authRouter.post('/otp/verify', otpVerifyLimiter, otpAuth.verifyOtp);
authRouter.post('/refresh', otpAuth.refresh);
authRouter.post('/logout', otpAuth.logout);
authRouter.post('/logout-all', requireAuth, otpAuth.logoutAll);
authRouter.get('/me', requireAuth, otpAuth.me);

// =========================== Admin (web) auth ================================
authRouter.post('/admin/login', authController.getAdminLogin);
authRouter.get('/admin/logout', authController.getAdminLogout);
authRouter.get('/admin/check-session', authController.getCheckAdminSession);

// =========================== Legacy (deprecated) =============================
// Kept temporarily so the currently-deployed app keeps working during rollout.
// TODO: remove once all clients use /otp/* — these are insecure (client OTP,
// returns PII, no tokens). Do not build new features on these.
authRouter.post('/login/caregiver', authController.postLogin);
authRouter.post('/user/save-mobile', authController.postSaveMobile);
authRouter.post('/login/verify-otp', authController.postVerifyOtp);

module.exports = authRouter;
