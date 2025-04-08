const Patient = require('./../models/patient');
const Caregivers = require('./../models/careGiver');

exports.getAdminPage = (req,res,next) => {
  
    res.render('admin/admin',{pageTitle: 'Welcome to Admin page'});
}

//get patients list for admin for frontend
/* exports.getPatients = (req, res, next) => {
  Patient.find()
    .then((registeredPatients) => {
      //console.log(json.registeredPatients);
      res.json({ patients: registeredPatients }); // Send JSON response
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to fetch patients" });
    });
}; */

exports.getPatients = (req, res, next) => {
  Patient.find()
    .then((registeredPatients) => {
      res.render("patient/patients_list", { patients: registeredPatients, pageTitle: "Patients List" });
    })
    .catch((err) => {
      res.status(500).send("Error retrieving patients");
    });
};

exports.getCareGivers = async (req, res, next) => {
  try {
    const caregivers = await Caregivers.find();
    res.render("caregiver/caregiver_list", { caregivers, pageTitle: "Caregivers List" });
  } catch (error) {
    console.error("Error fetching caregivers:", error);
    res.status(500).send("Error retrieving caregivers");
  }
};

exports.getNurses = async (req, res, next) => {
  try {
    const nurses = await Caregivers.find({ role: "Nurse" });
    res.render("caregiver/nurses_list", { nurses, pageTitle: "Nurse List" });
  } catch (error) {
    console.error("Error fetching nurses:", error);
    res.status(500).send("Error retrieving nurses");
  }
};

exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await Caregivers.find({ role: "Doctor" });
    res.render("caregiver/doctors_list", { doctors, pageTitle: "Doctor List" });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).send("Error retrieving doctors");
  }
};

exports.getPhysios = async (req, res, next) => {
  try {
    const physios = await Caregivers.find({ role: "Physio" });
    res.render("caregiver/physios_list", { physios, pageTitle: "Physio List" });
  } catch (error) {
    console.error("Error fetching physios:", error);
    res.status(500).send("Error retrieving physios");
  }
};

exports.getCleaners = async (req, res, next) => {
  try {
    const cleaners = await Caregivers.find({ role: "Cleaner" });
    res.render("caregiver/cleaners_list", { cleaners, pageTitle: "Cleaner List" });
  } catch (error) {
    console.error("Error fetching cleaners:", error);
    res.status(500).send("Error retrieving cleaners");
  }
};


exports.postApproveDoctor = async (req, res, next) => {
  try {
    const caregiverId = req.params.id;

    // Update caregiver status to Approved
    await Caregivers.findByIdAndUpdate(caregiverId, {
      status: "Approved",
    });

    res.redirect("/admin/caregivers/doctor");
  } catch (error) {
    console.error("Error approving doctor:", error);
    res.status(500).send("Server Error");
  }
};

exports.postApproveNurse = async (req, res, next) => {
  try {
    const caregiverId = req.params.id;

    // Update caregiver status to Approved
    await Caregivers.findByIdAndUpdate(caregiverId, {
      status: "Approved",
    });

    res.redirect("/admin/caregivers/nurse");
  } catch (error) {
    console.error("Error approving doctor:", error);
    res.status(500).send("Server Error");
  }
};

exports.postApprovePhysio = async (req, res, next) => {
  try {
    const caregiverId = req.params.id;

    // Update caregiver status to Approved
    await Caregivers.findByIdAndUpdate(caregiverId, {
      status: "Approved",
    });

    res.redirect("/admin/caregivers/physio");
  } catch (error) {
    console.error("Error approving Physion:", error);
    res.status(500).send("Server Error");
  }
};

exports.postApproveCleaner = async (req, res, next) => {
  try {
    const caregiverId = req.params.id;

    // Update caregiver status to Approved
    await Caregivers.findByIdAndUpdate(caregiverId, {
      status: "Approved",
    });

    res.redirect("/admin/caregivers/cleaner");
  } catch (error) {
    console.error("Error approving Cleaner:", error);
    res.status(500).send("Server Error");
  }
};