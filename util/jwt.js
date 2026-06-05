const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '60', 10);

if (!ACCESS_SECRET) {
  // Fail fast in any environment: a missing secret means tokens are unverifiable / forgeable.
  throw new Error('JWT_ACCESS_SECRET is not set. Add it to your environment (.env / Render).');
}

// Short-lived access token (sent as Bearer on every API call).
function signAccessToken(principal) {
  return jwt.sign(
    { sub: principal.id, kind: principal.kind, phone: principal.phone, role: principal.role || null },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

// Opaque refresh token: a random secret returned to the client; only its hash is stored.
function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MS());
  return { token, tokenHash, expiresAt };
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function REFRESH_TOKEN_MS() {
  return REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
};
