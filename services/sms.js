// ---------------------------------------------------------------------------
// Provider-agnostic SMS / OTP delivery layer.
//
// Switch providers entirely through environment variables — NO credentials are
// hardcoded here. Pick one with SMS_PROVIDER:
//
//   SMS_PROVIDER=dev            (default) logs the message; sends nothing.
//   SMS_PROVIDER=twilio         uses Twilio (already a project dependency).
//   SMS_PROVIDER=msg91          placeholder for an MSG91 DLT integration.
//
// Twilio env vars:
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_FROM                 e.g. +1XXXXXXXXXX  (or set TWILIO_MESSAGING_SERVICE_SID)
//   TWILIO_MESSAGING_SERVICE_SID (optional, takes priority over TWILIO_FROM)
//
// Shared:
//   SMS_COUNTRY_CODE            default +91 — prefixed to 10-digit numbers.
//   OTP_TTL_MIN                 used only for the OTP message text.
//
// To go live: set SMS_PROVIDER=twilio + the Twilio vars in the environment
// (Render dashboard / .env). No code change required.
// ---------------------------------------------------------------------------

const PROVIDER = (process.env.SMS_PROVIDER || 'dev').toLowerCase();
const COUNTRY_CODE = process.env.SMS_COUNTRY_CODE || '+91';

let twilioClient = null;

// Normalise a 10-digit local number to E.164 (e.g. 9876543210 -> +919876543210).
// Pass-through if it already looks international.
function toE164(phone) {
  const p = String(phone).trim();
  if (p.startsWith('+')) return p;
  return `${COUNTRY_CODE}${p.replace(/\D/g, '')}`;
}

function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error('Twilio is selected but TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not set.');
  }
  // Lazy require so the dependency only loads when actually used.
  twilioClient = require('twilio')(sid, token);
  return twilioClient;
}

async function sendSms(phone, message) {
  if (!phone) throw new Error('A destination phone number is required.');

  switch (PROVIDER) {
    case 'twilio': {
      const to = toE164(phone);
      const opts = { to, body: message };
      if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
        opts.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      } else if (process.env.TWILIO_FROM) {
        opts.from = process.env.TWILIO_FROM;
      } else {
        throw new Error('Set TWILIO_FROM or TWILIO_MESSAGING_SERVICE_SID for Twilio.');
      }

      try {
        const res = await getTwilioClient().messages.create(opts);
        console.log(`[sms:twilio] sent to ${to} (sid=${res.sid}, status=${res.status})`);
        return { provider: 'twilio', delivered: true, sid: res.sid };
      } catch (err) {
        console.error(`[sms:twilio] FAILED to ${to}: ${err.message}`);
        throw err;
      }
    }

    case 'msg91': {
      // Implement your approved MSG91 DLT flow here using env-based credentials
      // (e.g. MSG91_AUTHKEY, MSG91_TEMPLATE_ID). Intentionally not hardcoded.
      throw new Error('MSG91 provider not configured. Implement the msg91 branch with env credentials.');
    }

    case 'dev':
    default: {
      // Dev sender: surfaces the message in server logs instead of sending.
      // ⚠️ NEVER use SMS_PROVIDER=dev for real users.
      if (process.env.NODE_ENV === 'production') {
        console.warn('[sms] WARNING: SMS_PROVIDER=dev while NODE_ENV=production — no real SMS sent. Switch to a real provider before launch.');
      }
      console.log(`[sms:dev] -> ${toE164(phone)}: ${message}`);
      return { provider: 'dev', delivered: false };
    }
  }
}

// Convenience wrapper for OTP messages.
async function sendOtpSms(phone, code) {
  const ttl = process.env.OTP_TTL_MIN || 5;
  return sendSms(phone, `Your Naysan Home Health Care verification code is ${code}. It expires in ${ttl} minutes.`);
}

module.exports = { sendSms, sendOtpSms, toE164 };
