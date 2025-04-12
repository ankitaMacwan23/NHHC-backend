const Patient = require('./../models/patient');
const Caregivers = require('./../models/careGiver');

//--------------------for admin site functions--------------------------------------

// Return patients in JSON format for React frontend
exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ status: { $in: ["Pending", "Approved"] } });
    res.status(200).json({ patients });
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};
// Return patients in JSON format for React frontend
exports.getAllCareGivers = async (req, res, next) => {
  try {
    const pendingCaregivers = await Caregivers.find({ status: "Pending" });

    const approvedGrouped = await Caregivers.aggregate([
      { $match: { status: "Approved" } },
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
              address: "$address"
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






