const express = require('express');
const inquiryRouter = express.Router();

const inquiryController = require('../controllers/inquiryController');

// Public (mobile app Contact-Us)
inquiryRouter.post('/', inquiryController.createInquiry);

// Admin
inquiryRouter.get('/', inquiryController.getInquiries);
inquiryRouter.patch('/:id/status', inquiryController.updateInquiryStatus);

module.exports = inquiryRouter;
