const mongoose = require('mongoose');

// Opaque refresh tokens, stored only as a SHA-256 hash, one row per device/session.
// Enables: session restore, rotation, single-device logout, and logout-from-all-devices.
const refreshTokenSchema = new mongoose.Schema(
  {
    principalId: { type: String, required: true, index: true }, // caregiver _id or user _id
    kind: { type: String, enum: ['caregiver', 'user'], required: true },
    phone: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true },
    device: { type: String, default: 'unknown' },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
