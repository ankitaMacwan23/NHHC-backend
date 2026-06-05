const mongoose = require('mongoose');

// One in-flight OTP per phone. The code is stored only as a bcrypt hash.
const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    hash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 }, // failed verify attempts
    lastSentAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL cleanup: Mongo removes the doc shortly after it expires.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
