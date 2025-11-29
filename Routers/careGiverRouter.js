const express = require("express");
const careGiverRouter = express.Router();

const upload = require("../middleware/caregiverUpload"); // FIXED NAME
const careGiverController = require("../controllers/careGiverController");

// Admin routes
careGiverRouter.post("/update-caregiver", careGiverController.updateCaregiverStatus);
careGiverRouter.post("/add-to-favourite", careGiverController.postAddToFavourite);
careGiverRouter.post("/reject-caregiver", careGiverController.rejectCaregiver);

// App routes
careGiverRouter.post(
  "/add-caregiver",
  upload.fields([
    { name: "aadhar_document", maxCount: 1 },
    { name: "certificate_document", maxCount: 1 },
  ]),
  careGiverController.postAddCareGiver
);

careGiverRouter.post("/approved-caregivers-grouped", careGiverController.getApprovedCaregiversGrouped);
careGiverRouter.get("/caregivers-by-role/:role", careGiverController.getCaregiversByRole);

module.exports = careGiverRouter;
