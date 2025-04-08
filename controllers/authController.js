const Caregivers = require('../models/careGiver');
const User = require('../models/user');


//mobile no saved after first time user install app
exports.postSaveMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    console.log(mobile);

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    let user = await User.findOne({ mobile });

    if (!user) {
      user = new User({ mobile });
      await user.save();
    }

    res.status(200).json({ message: 'Mobile saved', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLogin = (req,res,next) => {
    res.render('auth/login',{ pageTitle: 'Patient Added'});
}

// authController.js
// const fast2sms = require('fast-two-sms'); // Commented out for now
const OTPStore = {}; // Save OTPs temporarily

exports.postLogin = async (req, res) => {
  const { mobile, role } = req.body;

  try {
    const caregiver = await Caregivers.findOne({
      contact: mobile,
      role: role,
      status: "Approved",
    });

    if (!caregiver) {
      return res.status(401).json({
        message: "Invalid credentials or account not approved by admin.",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    OTPStore[mobile] = otp;

    console.log(`OTP for ${mobile} is ${otp}`); // For now

    return res.json({ success: true, message: "OTP sent successfully (check console)" });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

exports.postVerifyOtp = async (req, res) => {
  const { mobile, otp, role } = req.body;

  const expectedOtp = OTPStore[mobile];

  if (otp === expectedOtp) {
    const caregiver = await Caregivers.findOne({ contact: mobile, role });

    if (!caregiver) {
      return res.status(404).json({ success: false, message: "Caregiver not found during OTP verification." });
    }

    delete OTPStore[mobile];
    return res.json({ success: true, caregiver });
  }

  return res.status(400).json({ success: false, message: "Invalid OTP" });
};

exports.OTPStore = OTPStore;

//without otp(uncomment later)
/* exports.postLogin = async (req, res, next) => {
  const { mobile, role } = req.body;

  try {
    const caregiver = await Caregivers.findOne({
      contact: mobile,
      role: role,
      status: "Approved",
    });

    if (!caregiver) {
      return res.status(401).json({
        message: "Invalid credentials or account not approved by admin.",
      });
    }

    res.status(200).json(caregiver);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};
 */

exports.postLogout = (req,res,next) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  })
}
  