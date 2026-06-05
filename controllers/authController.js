const bcrypt = require('bcryptjs');
const Caregivers = require('../models/careGiver');
const User = require('../models/user');
const AdminUser = require('../models/adminUser');

//--------------------------for admin site functions----------------------------------

exports.getAdminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const user = await AdminUser.findOne({ username });
    // Use a generic message + always-run compare path to avoid leaking which part failed.
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Support legacy plaintext passwords: if the stored value isn't a bcrypt hash,
    // compare directly and transparently upgrade it to a hash on success.
    const looksHashed = typeof user.password === 'string' && user.password.startsWith('$2');
    let ok;
    if (looksHashed) {
      ok = await bcrypt.compare(password, user.password);
    } else {
      ok = password === user.password;
      if (ok) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    req.session.isAdmin = true;
    req.session.user = { username: user.username };
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

// mobile no saved after first time user install app
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

// ----------------- OTP Logic (Simple Store, no SMS API) -----------------

// const fast2sms = require('fast-two-sms'); // Commented out for now
const OTPStore = {}; // Save OTPs temporarily

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
