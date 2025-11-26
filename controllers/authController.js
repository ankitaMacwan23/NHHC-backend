const Caregivers = require('../models/careGiver');
const User = require('../models/user');
const AdminUser = require('../models/adminUser');

//--------------------------for admin site functions----------------------------------

exports.getAdminLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await AdminUser.findOne({ username });
  
    if (!user) return res.status(401).json({ message: "Unauthorized" });
  
    req.session.isAdmin = true;
    req.session.user = { username: user.username }; // optional
    return res.json({ message: "Authorized" });
};

exports.getAdminLogout = async (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie('connect.sid'); // name of your session cookie
    res.status(200).json({ message: "Logged out successfully" });
  });
};

exports.getCheckAdminSession = (req, res) => {
  console.log("Session check called", req.session);
  if (req.session.isAdmin) {
    return res.json({ isAdmin: true });
  } else {
    return res.json({ isAdmin: false });
  }
};

//--------------------------for frontend(App) Functions------------------------------

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
    return res.json({ success: true, caregiver });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

//mobile no saved after first time user install app
exports.postSaveMobile = async (req, res) => {
  try {
    const { mobile } = req.body;

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








// authController.js
const axios = require('axios');
const OTPStore = {}; // Save OTPs temporarily

// Fast2SMS Helper
const sendSmsWithFast2Sms = async (toNumber, messageText) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    throw new Error('FAST2SMS_API_KEY not configured in environment');
  }

  // Format number: ensure it has country code (91 for India)
  let formattedNumber = String(toNumber).trim();
  if (!formattedNumber.startsWith('91') && formattedNumber.length === 10) {
    formattedNumber = '91' + formattedNumber; // add country code if missing
  }

  const payload = {
    route: 'v3',                    // transactional route (recommended for OTP)
    sender_id: 'FSTSMS',            // default; replace with your approved sender ID
    message: messageText,
    language: 'english',
    flash: 0,
    numbers: formattedNumber
  };

  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', payload, {
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ Fast2SMS response:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ Fast2SMS error:', err?.response?.data || err.message);
    throw err;
  }
};

// POST /auth/send-otp — Generate OTP and send via SMS
exports.postSendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || mobile.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid mobile number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    OTPStore[mobile] = otp;

    // Auto-expire OTP after 5 minutes
    setTimeout(() => {
      delete OTPStore[mobile];
      console.log(`OTP for ${mobile} expired`);
    }, 5 * 60 * 1000);

    const messageText = `Your Naysan Home Health Care OTP is: ${otp}. Do not share this with anyone.`;

    // Send via Fast2SMS
    if (process.env.FAST2SMS_API_KEY) {
      try {
        await sendSmsWithFast2Sms(mobile, messageText);
        console.log(`✅ OTP sent to ${mobile}`);
        return res.json({ success: true, message: 'OTP sent successfully' });
      } catch (smsErr) {
        console.error('Failed to send OTP via Fast2SMS:', smsErr.message);
        return res.status(500).json({ success: false, message: 'Failed to send OTP', error: smsErr.message });
      }
    } else {
      // Fallback: return OTP (development only — DO NOT USE IN PRODUCTION)
      console.warn('⚠️  FAST2SMS_API_KEY not set — returning OTP in response (dev only)');
      return res.json({ success: true, message: 'OTP generated (dev)', otp });
    }
  } catch (err) {
    console.error('postSendOtp error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
  