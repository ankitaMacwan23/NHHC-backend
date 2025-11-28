require("dotenv").config();

const Patient = require('./../models/patient');
const Caregivers = require("./../models/careGiver");
const { deleteFile } = require('../util/file');
const PatientToCaregiver = require("../models/patientToCaregiver");
const generateInvoice = require('../util/generateInvoice');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

//--------------------for admin site functions--------------------------------------

// after click on Deatail button from admin
exports.getPatientDetails = async (req, res, next) => {
  
  try {
    const caregivers = await Caregivers.find({ status: "Approved" });

    const groupedCaregivers = {
      doctors: caregivers.filter(c => c.role === "Doctor"),
      nurses: caregivers.filter(c => c.role === "Nurse"),
      physios: caregivers.filter(c => c.role === "Physio"),
      cleaners: caregivers.filter(c => c.role === "Cleaner"),
    };

    res.status(200).json({ caregivers: groupedCaregivers });
  } catch (err) {
    console.log("Error getting patient details:", err);
    res.status(500).json({ error: "Failed to fetch patient details" });
  }
};

// Get caregivers for payment view
exports.postPaymentInfo = async (req, res) => {
  try {
    const { patientId } = req.body;

    const caregivers = await PatientToCaregiver.find({
      patientId,
      payment_from_patient: "pending"
    }).populate("caregiverId");

    const result = caregivers.map(entry => ({
      ...entry._doc,
      caregiver: entry.caregiverId,
    }));

    res.status(200).json({ caregivers: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching caregiver payment data" });
  }
};

//reject patient click from admin
exports.rejectPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    await Patient.findByIdAndUpdate(patientId, { status: "Rejected" });

    res.status(200).json({ message: "Patient rejected successfully" });
  } catch (err) {
    console.error("Error rejecting patient:", err);
    res.status(500).json({ message: "Failed to reject patient" });
  }
};

exports.submitPatientPayment = async (req, res) => {
  try {
    const { id, charges, total, discount, extraCharges, finalTotal } = req.body;

    for (const entry of charges) {
      await PatientToCaregiver.findByIdAndUpdate(entry._id, {
        payment_from_patient: 'done',
        charge: entry.amount,
      });
    }

    await Patient.findByIdAndUpdate(id, { status: 'PaymentDone' });

    // Create a PDF
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=invoice.pdf',
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    });

    // PDF Content
    doc.fontSize(18).text('Patient Invoice', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Total: ₹${total}`);
    doc.text(`Discount: ₹${discount}`);
    doc.text(`Extra Charges: ₹${extraCharges}`);
    doc.text(`Final Total: ₹${finalTotal}`).moveDown();

    doc.text('Breakdown:', { underline: true });
    charges.forEach((item, index) => {
      doc.text(`${index + 1}. Service ID: ${item._id} - ₹${item.amount}`);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit payment' });
  }
};

//get alreday assigned caregivers to patient in patient-detail page
exports.getAssignedCaregivers = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    const assignments = await PatientToCaregiver.find({ patientId })
      .populate('caregiverId', 'name contact') // Only get name and contact
      .select('caregiverId duty date status');

    const formatted = assignments.map((a) => ({
      caregiverName: a.caregiverId.name,
      caregiverContact: a.caregiverId.contact,
      duty: a.duty,
      date: a.date,
      status: a.status,
    }));

    res.json({ caregivers: formatted });
  } catch (err) {
    console.error("Error fetching assigned caregivers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// After assigning caregiver to patient from patient-detail page
exports.postAssignCaregiver = async (req, res) => {
  try {
    const { patientId, allocationDate, duty } = req.body;

    // Validate required fields
    if (!allocationDate || !duty) {
      return res.status(400).json({ success: false, message: "Date and Duty are required." });
    }

    // Build caregiver list from form
    const caregivers = [];
    if (req.body.doctorId) {
      caregivers.push({ caregiverId: req.body.doctorId, caregiverRole: "Doctor" });
    }
    if (req.body.nurseId) {
      caregivers.push({ caregiverId: req.body.nurseId, caregiverRole: "Nurse" });
    }
    if (req.body.physioId) {
      caregivers.push({ caregiverId: req.body.physioId, caregiverRole: "Physio" });
    }
    if (req.body.cleanerId) {
      caregivers.push({ caregiverId: req.body.cleanerId, caregiverRole: "Cleaner" });
    }

    // Validate caregiver list
    if (caregivers.length === 0) {
      return res.status(400).json({ success: false, message: "At least one caregiver must be selected." });
    }

    // Validate allocation date (not in the past)
    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(allocationDate).setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ success: false, message: "Allocation date cannot be in the past." });
    }

    const patientData = await Patient.findById(patientId);
    if (!patientData) {
      return res.status(404).json({ success: false, message: "Invalid patient." });
    }

    const createdAssignments = [];

    for (const caregiver of caregivers) {
      const caregiverData = await Caregivers.findById(caregiver.caregiverId);
      if (!caregiverData) {
        return res.status(404).json({ success: false, message: `Invalid caregiver selected.` });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const assignment = await PatientToCaregiver.create({
        patientId,
        caregiverId: caregiver.caregiverId,
        caregiverRole: caregiver.caregiverRole,
        date: allocationDate,
        duty,
        verificationCode,
        status: "service_pending",
        payment_to_caregiver: "pending",
        payment_from_patient: "pending"
      });

      createdAssignments.push(assignment);
    }

    // ✅ Update patient status to "Approved"
    await Patient.findByIdAndUpdate(patientId, { status: 'Approved' });

    return res.status(200).json({
      success: true,
      message: "Caregiver(s) assigned successfully.",
      assignments: createdAssignments
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to assign caregiver.", error: err.message });
  }
};




//--------------------------for frontend(App) Functions------------------------------

//add patient data after patient registration
exports.postAddPatient = async (req, res) => {
  try {
    const {
      patientName,
      patientGender,
      patientAge,
      patientContact,
      patientEmail,
      patientAddress,
    } = req.body;

    const documentPath = req.file ? req.file.path : null;

    const newPatient = new Patient({
      patientName,
      patientGender,
      patientAge,
      patientContact,
      patientEmail,
      patientAddress,
      document: documentPath
    });

    const savedPatient = await newPatient.save();

    res.status(201).json({
      success: true,
      message: "Patient added successfully",
      patient: savedPatient
    });

  } catch (error) {
    console.error("Error saving patient:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


//get assigned patient to caregiver for frontend
exports.getAssignedPatientToCareGiver = async (req, res) => {
  try {
    const { caregiverId, role } = req.body;

    const assignedTasks = await PatientToCaregiver.find({
      caregiverId,
      caregiverRole: role,
      status: 'service_pending',
      date: { $gte: new Date() },
    }).populate('patientId');

    const tasks = assignedTasks.map((item) => {
      const patient = item.patientId;

      return {
        patientId: patient._id,
        patientName: patient.patientName,
        gender: patient.patientGender,
        age: patient.patientAge,
        mobile: patient.patientContact,
        address: patient.patientAddress,
        duty: item.duty,
        date: item.date,
        status: item.status,
        verificationCode: item.verificationCode,
      };
    });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching assigned patients:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//show completed task of caregiver
exports.getCompletedAssignedPatients = async (req, res) => {
  try {
    const { caregiverId, role } = req.body;

    const assignedTasks = await PatientToCaregiver.find({
      caregiverId,
      caregiverRole: role,
      status: 'service_completed',
    }).populate('patientId');

    const tasks = assignedTasks.map((item) => {
      const patient = item.patientId;

      return {
        patientId: patient._id,
        patientName: patient.patientName,
        gender: patient.patientGender,
        age: patient.patientAge,
        mobile: patient.patientContact,
        address: patient.patientAddress,
        duty: item.duty,
        date: item.date,
      };
    });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching assigned patients:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.verifyPatientCode = async (req, res) => {
  try {
    const { caregiverId, patientId, enteredCode,date, duty } = req.body;

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const task = await PatientToCaregiver.findOne({
      caregiverId,
      patientId,
      duty,
      status: 'service_pending',
      date: { $gte: startOfDay, $lte: endOfDay }, // match date ignoring time
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "No matching pending task found" });
    }

    if (task.verificationCode === enteredCode) {
      task.status = "service_completed";
      await task.save();
      return res.json({ success: true, message: "Service verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Incorrect verification code" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};


















  


