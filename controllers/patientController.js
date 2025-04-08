require("dotenv").config();

const Patient = require('./../models/patient');
const Caregivers = require("./../models/careGiver");
const { deleteFile } = require('../util/file');
const PatientToCaregiver = require("../models/patientToCaregiver");

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

// controllers/patientController.js
exports.verifyPatientCode = async (req, res) => {
  try {
    const { caregiverId, patientId, enteredCode,date, duty } = req.body;

    console.log(date);

    // Convert the date string to a Date object and set it to midnight for exact match
    //const taskDate = new Date(date);
    //taskDate.setHours(0, 0, 0, 0);

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

// After assigning caregiver to patient from patient-detail page
exports.postAssignCaregiver = async (req, res) => {
  try {
    const { patientId, allocationDate, duty } = req.body;

    // Validate required fields
    if (!allocationDate || !duty) {
      req.flash("error_msg", "Date and Duty are required.");
      return res.redirect(`/patient/detail-patient/${patientId}`);
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
      req.flash("error_msg", "At least one caregiver must be selected.");
      return res.redirect(`/patient/detail-patient/${patientId}`);
    }

    // Check if allocation date is valid (not in the past)
    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(allocationDate).setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      req.flash("error_msg", "Allocation date cannot be in the past.");
      return res.redirect(`/patient/detail-patient/${patientId}`);
    }

    const patientData = await Patient.findById(patientId);
    if (!patientData) {
      req.flash("error_msg", "Invalid patient.");
      return res.redirect(`/patient/detail-patient/${patientId}`);
    }

    for (const caregiver of caregivers) {
      const caregiverData = await Caregivers.findById(caregiver.caregiverId);
      if (!caregiverData) {
        req.flash("error_msg", `Invalid caregiver selected.`);
        return res.redirect(`/patient/detail-patient/${patientId}`);
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      await PatientToCaregiver.create({
        patientId,
        caregiverId: caregiver.caregiverId,
        caregiverRole: caregiver.caregiverRole,
        date: allocationDate,
        duty,
        verificationCode,
        status: "service_pending"
      });
    }
    // ✅ Update patient status to "Approved"
    await Patient.findByIdAndUpdate(patientId, { status: 'Approved' });

    req.flash("success_msg", "Caregiver(s) assigned successfully.");
    res.redirect(`/patient/detail-patient/${patientId}`);

  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to assign caregiver.");
    res.redirect(`/patient/detail-patient/${patientId}`);
  }
};

//add patient data after patient registration
exports.postAddPatient = async (req, res, next) => {
  try {
    const {
      patientName,
      patientGender,
      patientAge,
      patientContact,
      patientEmail,
      patientAddress,
    } = req.body;

    // Ensure phone number is in E.164 format
   /*  const formatPhoneNumber = (number) => {
      if (!number || typeof number !== "string" || number.trim() === "") {
        throw new Error("Contact number is required and must be a non-empty string.");
      }
    
      // Remove non-digit characters (optional, for sanitization)
      let cleaned = number.replace(/\D/g, "");
    
      if (cleaned.length !== 10) {
        throw new Error("Contact number must be a valid 10-digit number.");
      }
    
      return "+91" + cleaned;
    }; */
    
    

   // const formattedContact = formatPhoneNumber(patientContact);

    const newPatient = new Patient({
      patientName,
      patientGender,
      patientAge,
      //patientContact: formattedContact,
      patientContact,
      patientEmail,
      patientAddress,
    });

    const savedPatient = await newPatient.save();

    // ✅ Return JSON response
    res.status(201).json({
      message: "Patient added successfully",
      patient: savedPatient,
    });
  } catch (error) {
    console.error("Error saving patient:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message || error,
    });
  }
};

// get Add Patient form
exports.getAddPatient = (req,res,next) => {
     res.render('patient/edit-patient',{editing : false, pageTitle: 'Add Patient'});
 }

 //get Edit Patient form
 exports.getEditPatient = (req,res,next) => {
  const patientID =  req.params.patientId;
  const editing = req.query.editing === 'true';

  if(!editing){
    console.log('Editing flag not set properly');
    return res.redirect('/admin');
  }
  Patient.findById(patientID).then((patient) => {
    if(!patient){
      res.redirect('/admin');
    }
    console.log('Edit patient desc', patient);
    res.render('patient/edit-patient',{ patient : patient, editing: editing, pageTitle: 'Edit Your Page'});
  })
}

   //after cleck on delete button
  exports.postDeletePatient = (req, res, next) => {
  const patientId = req.params.patientId;

  Patient.findById(patientId)
    .then((patient) => {
      if (!patient) {
        return res.redirect('/admin');
      }

      // Check if a file exists and delete it
      if (patient.medicationPhotoUrl) {
        deleteFile(patient.medicationPhotoUrl); // Delete old file
      }
      return Patient.findByIdAndDelete(patientId);
    })
    .then(() => {
      res.redirect('/admin');
    })
    .catch((err) => {
      console.log('Error while deleting:', err);
    });
};

// after click on Deatail button from admin
exports.getPatientDetails = async (req, res, next) => {
  const patientId = req.params.patientId;

  try {
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.redirect("/admin");
    }

    // Get caregivers grouped by role
    const caregivers = await Caregivers.find({ status: "Approved" });
    const groupedCaregivers = {
      doctors: caregivers.filter(c => c.role === "Doctor"),
      nurses: caregivers.filter(c => c.role === "Nurse"),
      physios: caregivers.filter(c => c.role === "Physio"),
      cleaners: caregivers.filter(c => c.role === "Cleaner"),
    };

    res.render("patient/patient-detail", {
      pageTitle: "Patient Details",
      patient,
      caregivers: groupedCaregivers,
      query: req.query
    });
  } catch (err) {
    console.log("Error getting patient details:", err);
    res.redirect("/admin");
  }
};


//after click on update form of add patient
exports.postEditPatient = (req, res, next) => {
  
  const { id, patientName, patientGender, patientAge, patientContact, patientEmail, patientAddress} =  req.body;

  Patient.findById(id).then((exitingPatient) => {

    if(!exitingPatient){
      console.log('Home not found for editing');
      return res.redirect('/');
    }

    exitingPatient.patientName = patientName;
    exitingPatient.patientGender = patientGender;
    exitingPatient.patientAge = patientAge;
    exitingPatient.patientContact = patientContact;
    exitingPatient.patientEmail = patientEmail;
    exitingPatient.patientAddress = patientAddress;

    // Check if a new file is uploaded
    if (req.file) {
      if (exitingPatient.medicationPhotoUrl) {
        deleteFile(exitingPatient.medicationPhotoUrl); // Delete old file
      }
      exitingPatient.medicationPhotoUrl = req.file.path.replace(/\\/g, '/'); // Save new file path
    }

    return exitingPatient.save();
  }).then(() => {
    res.redirect("/admin");
  }).catch((err) => {
    console.log('Error while updating home',err);
  })
}

