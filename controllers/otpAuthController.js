const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const Otp = require('../models/otp');
const RefreshToken = require('../models/refreshToken');
const Caregivers = require('../models/careGiver');
const User = require('../models/user');
const { sendOtpSms } = require('../services/sms');
const { signAccessToken, generateRefreshToken, hashRefreshToken } = require('../util/jwt');

const OTP_TTL_MIN = parseInt(process.env.OTP_TTL_MIN || '5', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_RESEND_COOLDOWN_SEC = parseInt(process.env.OTP_RESEND_COOLDOWN_SEC || '30', 10);
const VALID_ROLES = ['Nurse', 'Doctor', 'Physio', 'Cleaner'];

const isValidPhone = (p) => typeof p === 'string' && /^[6-9]\d{9}$/.test(p);

// The caregiver's OWN profile, returned only after they authenticate via OTP.
// Excludes document URLs (Aadhaar/certificate) — those must be fetched through
// the authorized, signed document endpoint (Phase 2), never embedded here.
const ownCaregiverProfile = (c) => ({
  id: c._id,
  name: c.name,
  role: c.role,
  status: c.status,
  gender: c.gender,
  dob: c.dob,
  contact: c.contact,
  email: c.email,
  address: c.address,
});

// ----------------------------------------------------------------------------
// POST /auth/otp/request   { phone, role? }
// Always responds 200 on a valid phone (no account enumeration). Generates,
// hashes, and "sends" a 6-digit code with expiry + resend cooldown.
// ----------------------------------------------------------------------------
exports.requestOtp = async (req, res) => {
  try {
    const phone = (req.body.phone || '').trim();
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number.' });
    }

    const existing = await Otp.findOne({ phone });
    if (existing && Date.now() - existing.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_SEC * 1000) {
      const wait = Math.ceil((OTP_RESEND_COOLDOWN_SEC * 1000 - (Date.now() - existing.lastSentAt.getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${wait}s before requesting another code.`, retryAfter: wait });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const hash = await bcrypt.hash(code, 10);

    await Otp.findOneAndUpdate(
      { phone },
      { phone, hash, attempts: 0, expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60 * 1000), lastSentAt: new Date() },
      { upsert: true, new: true }
    );

    await sendOtpSms(phone, code);

    return res.json({ success: true, message: 'Verification code sent.' });
  } catch (err) {
    console.error('requestOtp error:', err);
    return res.status(500).json({ message: 'Could not send verification code. Please try again.' });
  }
};

// ----------------------------------------------------------------------------
// POST /auth/otp/verify   { phone, otp, role?, device? }
// Verifies the code; on success issues an access JWT + opaque refresh token.
// If `role` is supplied, the caller must be an Approved caregiver of that role.
// ----------------------------------------------------------------------------
exports.verifyOtp = async (req, res) => {
  try {
    const phone = (req.body.phone || '').trim();
    const otp = (req.body.otp || '').trim();
    const role = req.body.role ? String(req.body.role).trim() : null;
    const device = req.body.device ? String(req.body.device).slice(0, 120) : 'unknown';

    if (!isValidPhone(phone) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid phone or code.' });
    }

    const record = await Otp.findOne({ phone });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Code expired. Please request a new one.', code: 'OTP_EXPIRED' });
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.', code: 'OTP_LOCKED' });
    }

    const ok = await bcrypt.compare(otp, record.hash);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      const left = OTP_MAX_ATTEMPTS - record.attempts;
      return res.status(400).json({ message: `Incorrect code.${left > 0 ? ` ${left} attempt(s) left.` : ''}`, code: 'OTP_INVALID' });
    }

    // Code is correct — consume it.
    await Otp.deleteOne({ _id: record._id });

    // Resolve identity.
    let principal;
    let userPayload;
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: 'Invalid role.' });
      }
      const caregiver = await Caregivers.findOne({ contact: phone, role, status: 'Approved' });
      if (!caregiver) {
        return res.status(403).json({ message: 'No approved account found for this number and role. Please contact admin.' });
      }
      principal = { id: caregiver._id.toString(), kind: 'caregiver', phone, role };
      userPayload = { kind: 'caregiver', ...ownCaregiverProfile(caregiver) };
    } else {
      let user = await User.findOne({ mobile: phone });
      if (!user) user = await User.create({ mobile: phone });
      principal = { id: user._id.toString(), kind: 'user', phone };
      userPayload = { kind: 'user', id: user._id, mobile: user.mobile };
    }

    const tokens = await issueTokens(principal, device);
    return res.json({ success: true, ...tokens, user: userPayload });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// ----------------------------------------------------------------------------
// POST /auth/refresh   { refreshToken }
// Rotates the refresh token and returns a fresh access token. Reuse of a
// revoked/expired token fails with 401 (client then routes to login).
// ----------------------------------------------------------------------------
exports.refresh = async (req, res) => {
  try {
    const provided = (req.body.refreshToken || '').trim();
    if (!provided) return res.status(401).json({ message: 'Missing refresh token.' });

    const tokenHash = hashRefreshToken(provided);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }

    // Rotation: revoke the old token, issue a new pair.
    stored.revokedAt = new Date();
    await stored.save();

    const principal = { id: stored.principalId, kind: stored.kind, phone: stored.phone };
    if (stored.kind === 'caregiver') {
      const caregiver = await Caregivers.findById(stored.principalId);
      if (!caregiver || caregiver.status !== 'Approved') {
        return res.status(401).json({ message: 'Account is no longer active.' });
      }
      principal.role = caregiver.role;
    }

    const tokens = await issueTokens(principal, stored.device);
    return res.json({ success: true, ...tokens });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(500).json({ message: 'Could not refresh session.' });
  }
};

// POST /auth/logout   { refreshToken }   — revoke a single device session.
exports.logout = async (req, res) => {
  try {
    const provided = (req.body.refreshToken || '').trim();
    if (provided) {
      await RefreshToken.findOneAndUpdate({ tokenHash: hashRefreshToken(provided) }, { revokedAt: new Date() });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ message: 'Logout failed.' });
  }
};

// POST /auth/logout-all   (requireAuth) — revoke every session for the principal.
exports.logoutAll = async (req, res) => {
  try {
    await RefreshToken.updateMany(
      { principalId: req.user.sub, revokedAt: null },
      { revokedAt: new Date() }
    );
    return res.json({ success: true, message: 'Signed out from all devices.' });
  } catch (err) {
    console.error('logoutAll error:', err);
    return res.status(500).json({ message: 'Could not sign out from all devices.' });
  }
};

// GET /auth/me   (requireAuth) — current principal (used to confirm session).
exports.me = async (req, res) => {
  return res.json({ user: { id: req.user.sub, kind: req.user.kind, phone: req.user.phone, role: req.user.role } });
};

// --- helper: persist a refresh token and return the token pair --------------
async function issueTokens(principal, device) {
  const accessToken = signAccessToken(principal);
  const { token, tokenHash, expiresAt } = generateRefreshToken();
  await RefreshToken.create({
    principalId: principal.id,
    kind: principal.kind,
    phone: principal.phone,
    tokenHash,
    device,
    expiresAt,
  });
  return { accessToken, refreshToken: token };
}
