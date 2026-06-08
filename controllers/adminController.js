const Patient = require('./../models/patient');
const Caregivers = require('./../models/careGiver');
const Inquiry = require('./../models/inquiry');

//--------------------for admin site functions--------------------------------------

// Dashboard statistics for the admin home page.
exports.getStats = async (req, res) => {
  try {
    const [
      totalPatients,
      pendingPatients,
      paymentDonePatients,
      totalCaregivers,
      pendingCaregivers,
      approvedCaregivers,
      totalInquiries,
      unsolvedInquiries,
    ] = await Promise.all([
      Patient.countDocuments({}),
      Patient.countDocuments({ status: 'Pending' }),
      Patient.countDocuments({ status: 'PaymentDone' }),
      Caregivers.countDocuments({}),
      Caregivers.countDocuments({ status: 'Pending' }),
      Caregivers.countDocuments({ status: 'Approved' }),
      Inquiry.countDocuments({}),
      Inquiry.countDocuments({ status: 'Unsolved' }),
    ]);

    res.status(200).json({
      stats: {
        totalPatients,
        pendingPatients,
        paymentDonePatients,
        totalCaregivers,
        pendingCaregivers,
        approvedCaregivers,
        totalInquiries,
        unsolvedInquiries,
      },
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Return patients in JSON format for React frontend
exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ status: { $in: ["Pending", "Approved"] } }).sort({ _id: -1 });
    res.status(200).json({ patients });
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};
// Return patients in JSON format for React frontend
// Return caregivers in JSON format for React frontend
exports.getAllCareGivers = async (req, res, next) => {
  try {
    const pendingCaregivers = await Caregivers.find({ status: "Pending" }).sort({ _id: -1 });

    const approvedGrouped = await Caregivers.aggregate([
      { $match: { status: "Approved" } },
      { $sort: { _id: -1 } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          caregivers: {
            $push: {
              _id: "$_id",
              name: "$name",
              gender: "$gender",
              dob: "$dob",
              contact: "$contact",
              email: "$email",
              address: "$address",

              // ⭐ Add these fields
              aadhar_document: "$aadhar_document",
              certificate_document: "$certificate_document"
            }
          }
        }
      }
    ]);

    res.status(200).json({
      pendingCaregivers,
      approvedGrouped
    });
  } catch (error) {
    console.error("Error fetching caregivers:", error);
    res.status(500).json({ error: "Failed to fetch caregivers" });
  }
};



//--------------------------for frontend(App) Functions------------------------------






