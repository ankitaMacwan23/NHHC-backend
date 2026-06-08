require("dotenv").config();

const Patient = require('./../models/patient');
const Caregivers = require("./../models/careGiver");
const { deleteFile } = require('../util/file');
const PatientToCaregiver = require("../models/patientToCaregiver");
const generateInvoice = require('../util/generateInvoice');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');
const { sendMail } = require('../services/email');

// ----------------------------------------------------------------------------
// Invoice helpers (shared by download + email)
// ----------------------------------------------------------------------------

// Turn the `charges` payload ([{ _id, amount }]) into labelled line items by
// resolving each assignment's caregiver name/role.
const resolveInvoiceLineItems = async (charges = []) => {
  const items = [];
  for (const entry of charges) {
    let label = `Service ${entry._id}`;
    try {
      const asg = await PatientToCaregiver.findById(entry._id).populate('caregiverId', 'name');
      if (asg) {
        const name = asg.caregiverId ? asg.caregiverId.name : 'Caregiver';
        label = `${name} (${asg.caregiverRole})`;
      }
    } catch (_) {
      // fall back to the generic label
    }
    items.push({ label, amount: Number(entry.amount) || 0 });
  }
  return items;
};

// Build the invoice PDF in-memory and resolve to a Buffer.
const buildInvoicePdfBuffer = ({ patient, lineItems = [], total = 0, discount = 0, extraCharges = 0, finalTotal = 0 }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Naysan Home Health Care', { align: 'center' });
    doc.fontSize(14).text('Patient Invoice', { align: 'center' }).moveDown();

    doc.fontSize(12)
      .text(`Patient Name: ${patient?.patientName || '-'}`)
      .text(`Patient ID: ${patient?._id || '-'}`)
      .text(`Contact: ${patient?.patientContact || '-'}`)
      .moveDown();

    doc.fontSize(13).text('Breakdown:', { underline: true }).moveDown(0.5);
    lineItems.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item.label} — ₹${item.amount}`);
    });

    doc.moveDown()
      .fontSize(12)
      .text(`Subtotal: ₹${total}`)
      .text(`Discount: ₹${discount}`)
      .text(`Extra Charges: ₹${extraCharges}`)
      .text(`Final Total: ₹${finalTotal}`)
      .moveDown();

    doc.fontSize(10).text('Thank you for choosing Naysan Home Health Care!', { align: 'center' });
    doc.end();
  });

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
    }).populate("caregiverId").sort({ _id: -1 });

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

    const patient = await Patient.findByIdAndUpdate(
      id,
      {
        status: 'PaymentDone',
        paymentSummary: {
          baseAmount: Number(total) || 0,
          discount: Number(discount) || 0,
          extraCharges: Number(extraCharges) || 0,
          finalTotal: Number(finalTotal) || 0,
          paidAt: new Date(),
        },
      },
      { new: true }
    );

    // Build the invoice and stream it back for download.
    const lineItems = await resolveInvoiceLineItems(charges);
    const pdfBuffer = await buildInvoicePdfBuffer({ patient, lineItems, total, discount, extraCharges, finalTotal });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice_${patient?.patientName || 'patient'}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit payment' });
  }
};

// Email the generated invoice to the patient's email (if one is on file).
exports.emailInvoice = async (req, res) => {
  try {
    const { id, charges, total, discount, extraCharges, finalTotal } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    if (!patient.patientEmail) {
      return res.status(400).json({ success: false, message: 'This patient has no email address on file.' });
    }

    const lineItems = await resolveInvoiceLineItems(charges || []);
    const pdfBuffer = await buildInvoicePdfBuffer({ patient, lineItems, total, discount, extraCharges, finalTotal });

    const result = await sendMail({
      to: patient.patientEmail,
      subject: 'Your Naysan Home Health Care Invoice',
      text: `Dear ${patient.patientName},\n\nPlease find your invoice attached. Final amount payable: ₹${finalTotal}.\n\nThank you for choosing Naysan Home Health Care.`,
      attachments: [
        { filename: `invoice_${patient.patientName}.pdf`, content: pdfBuffer, contentType: 'application/pdf' },
      ],
    });

    return res.json({
      success: true,
      delivered: result.delivered,
      message: result.delivered
        ? `Invoice emailed to ${patient.patientEmail}.`
        : `Email is in dev mode — set EMAIL_* env vars to deliver for real. (Would send to ${patient.patientEmail}.)`,
    });
  } catch (err) {
    console.error('emailInvoice error:', err);
    return res.status(500).json({ success: false, message: 'Failed to email the invoice.' });
  }
};

// Admin: list every patient whose payment is done, with their caregivers + charges.
exports.getPaymentDonePatients = async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'PaymentDone' }).sort({ _id: -1 });

    const result = [];
    for (const p of patients) {
      const assignments = await PatientToCaregiver.find({ patientId: p._id })
        .populate('caregiverId', 'name contact role')
        .sort({ _id: -1 });

      const summary = p.paymentSummary || {};
      result.push({
        _id: p._id,
        patientName: p.patientName,
        patientGender: p.patientGender,
        patientAge: p.patientAge,
        patientContact: p.patientContact,
        patientEmail: p.patientEmail || '',
        patientAddress: p.patientAddress,
        status: p.status,
        // Full breakdown so the report can show base / discount / extra / final.
        baseAmount: summary.baseAmount || 0,
        discount: summary.discount || 0,
        extraCharges: summary.extraCharges || 0,
        finalTotal: summary.finalTotal || 0,
        paidAt: summary.paidAt || null,
        caregivers: assignments.map((a) => ({
          name: a.caregiverId ? a.caregiverId.name : '-',
          contact: a.caregiverId ? a.caregiverId.contact : '-',
          role: a.caregiverRole,
          date: a.date,
          duty: a.duty,
          charge: a.charge || 0,
          serviceStatus: a.status,
        })),
        totalCharge: assignments.reduce((sum, a) => sum + (a.charge || 0), 0),
      });
    }

    res.status(200).json({ patients: result });
  } catch (err) {
    console.error('Error fetching payment-done patients:', err);
    res.status(500).json({ error: 'Failed to fetch payment-done patients' });
  }
};

// --------------------------------------------------------------------------
// Patient home-health-care history, looked up by mobile number.
// GET /patient/history?mobile=XXXXXXXXXX
// Returns every service request for that number with its caregivers, visits,
// payment breakdown, status and document — for a timeline view in the app.
// --------------------------------------------------------------------------
exports.getPatientHistory = async (req, res) => {
  try {
    const mobile = (req.query.mobile || req.body.mobile || '').toString().trim();
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
    }

    const patients = await Patient.find({ patientContact: mobile }).sort({ _id: -1 });
    if (!patients.length) {
      return res.status(200).json({ success: true, mobile, records: [], message: 'No history found for this number.' });
    }

    const records = [];
    for (const p of patients) {
      const assignments = await PatientToCaregiver.find({ patientId: p._id })
        .populate('caregiverId', 'name contact role')
        .sort({ date: -1 });

      const summary = p.paymentSummary || {};
      records.push({
        patientId: p._id,
        patientName: p.patientName,
        gender: p.patientGender,
        age: p.patientAge,
        contact: p.patientContact,
        email: p.patientEmail || '',
        address: p.patientAddress,
        status: p.status,
        document: p.document || null,
        createdAt: p.createdAt || null,
        payment: {
          baseAmount: summary.baseAmount || 0,
          discount: summary.discount || 0,
          extraCharges: summary.extraCharges || 0,
          finalTotal: summary.finalTotal || 0,
          paidAt: summary.paidAt || null,
          done: p.status === 'PaymentDone',
        },
        visits: assignments.map((a) => ({
          caregiverName: a.caregiverId ? a.caregiverId.name : '-',
          caregiverContact: a.caregiverId ? a.caregiverId.contact : '-',
          role: a.caregiverRole,
          date: a.date,
          duty: a.duty,
          serviceStatus: a.status, // service_pending | service_completed
          charge: a.charge || 0,
        })),
      });
    }

    return res.status(200).json({ success: true, mobile, records });
  } catch (err) {
    console.error('getPatientHistory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch history.' });
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
      .select('caregiverId duty date status')
      .sort({ date: -1 });

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

    const documentUrl = req.file ? req.file.path : null; // <-- Cloudinary URL

    // Document upload is MANDATORY.
    if (!documentUrl) {
      return res.status(400).json({
        success: false,
        message: "A document upload is required.",
      });
    }

    // Email is OPTIONAL — store undefined (not "") when not provided.
    const normalizedEmail =
      patientEmail && patientEmail.trim() ? patientEmail.trim() : undefined;

    const newPatient = new Patient({
      patientName,
      patientGender,
      patientAge,
      patientContact,
      patientEmail: normalizedEmail,
      patientAddress,
      document: documentUrl,
    });

    const savedPatient = await newPatient.save();

    res.status(201).json({
      success: true,
      message: "Patient added successfully",
      patient: savedPatient,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
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
      // Once the patient has paid for an assignment it is closed out — drop it
      // from the caregiver's pending list so it never shows again.
      payment_from_patient: { $ne: 'done' },
      date: { $gte: new Date() },
    }).populate('patientId').sort({ date: -1 });

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
    }).populate('patientId').sort({ date: -1 });

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


















  


