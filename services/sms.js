// ---------------------------------------------------------------------------
// Provider-agnostic SMS / OTP delivery layer.
//
// Switch providers entirely through environment variables — NO credentials are
// hardcoded here. Pick one with SMS_PROVIDER:
//
//   SMS_PROVIDER=dev            (default) logs the message; sends nothing.
//   SMS_PROVIDER=msg91          MSG91 Flow API (recommended for India / +91).
//   SMS_PROVIDER=twilio         Twilio (global).
//
// MSG91 env vars (see SMS_MSG91_SETUP.md):
//   MSG91_AUTHKEY              your MSG91 auth key
//   MSG91_OTP_TEMPLATE_ID      DLT-approved OTP flow/template id
//   MSG91_OTP_VAR              template variable name that holds the code (default: otp)
//   MSG91_TEMPLATE_ID          optional generic fallback template id
//
// Twilio env vars:
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
//   TWILIO_FROM  (or TWILIO_MESSAGING_SERVICE_SID)
//
// Shared:
//   SMS_COUNTRY_CODE           default +91 — prefixed to 10-digit numbers.
//   OTP_TTL_MIN                used only for the OTP message text.
//
// To go live: set SMS_PROVIDER=msg91 + the MSG91 vars in the environment
// (Render dashboard / .env). No code change required.
// ---------------------------------------------------------------------------

const PROVIDER = (process.env.SMS_PROVIDER || 'dev').toLowerCase();
const COUNTRY_CODE = process.env.SMS_COUNTRY_CODE || '+91';

let twilioClient = null;

const digitsOnly = (phone) => String(phone).replace(/\D/g, '');

// E.164 (+919876543210) — used by Twilio.
function toE164(phone) {
  const p = String(phone).trim();
  if (p.startsWith('+')) return p;
  return `${COUNTRY_CODE}${digitsOnly(p)}`;
}

// MSG91 wants the number WITH country code but WITHOUT the leading '+' (919876543210).
function toMsg91Mobile(phone) {
  const d = digitsOnly(phone);
  const cc = digitsOnly(COUNTRY_CODE) || '91';
  return d.length === 10 ? `${cc}${d}` : d; // already includes a country code
}

function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error('Twilio is selected but TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not set.');
  }
  twilioClient = require('twilio')(sid, token);
  return twilioClient;
}

// --- MSG91 (Flow API v5) ----------------------------------------------------
// DLT requires every message to map to an approved template, so we send a
// template_id plus the variable(s) it expects (e.g. the OTP code) — not free text.
async function sendViaMsg91({ templateId, variables, phone, message }) {
  const authkey = process.env.MSG91_AUTHKEY;
  if (!authkey) {
    throw new Error('MSG91 is selected but MSG91_AUTHKEY is not set.');
  }

  const tpl = templateId || process.env.MSG91_TEMPLATE_ID;
  if (!tpl) {
    // No DLT template for this message type yet — don't crash unrelated flows
    // (e.g. caregiver approve/reject notifications) before their templates exist.
    console.warn(`[sms:msg91] no template id for this message; skipping real send. "${(message || '').slice(0, 50)}"`);
    return { provider: 'msg91', delivered: false, skipped: true };
  }

  const recipient = { mobiles: toMsg91Mobile(phone), ...(variables || {}) };
  const payload = { template_id: tpl, short_url: '0', recipients: [recipient] };

  try {
    const res = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data && data.type === 'error')) {
      console.error(`[sms:msg91] FAILED to ${recipient.mobiles}:`, data);
      throw new Error(data.message || `MSG91 send failed (HTTP ${res.status})`);
    }
    console.log(`[sms:msg91] sent to ${recipient.mobiles} (request_id=${data.request_id || 'n/a'})`);
    return { provider: 'msg91', delivered: true, requestId: data.request_id };
  } catch (err) {
    console.error(`[sms:msg91] error: ${err.message}`);
    throw err;
  }
}

// `opts` (optional): { templateId, variables } — used by flow-based providers (MSG91).
async function sendSms(phone, message, opts = {}) {
  if (!phone) throw new Error('A destination phone number is required.');

  switch (PROVIDER) {
    case 'msg91':
      return sendViaMsg91({ templateId: opts.templateId, variables: opts.variables, phone, message });

    case 'twilio': {
      const to = toE164(phone);
      const sendOpts = { to, body: message };
      if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
        sendOpts.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      } else if (process.env.TWILIO_FROM) {
        sendOpts.from = process.env.TWILIO_FROM;
      } else {
        throw new Error('Set TWILIO_FROM or TWILIO_MESSAGING_SERVICE_SID for Twilio.');
      }
      try {
        const r = await getTwilioClient().messages.create(sendOpts);
        console.log(`[sms:twilio] sent to ${to} (sid=${r.sid}, status=${r.status})`);
        return { provider: 'twilio', delivered: true, sid: r.sid };
      } catch (err) {
        console.error(`[sms:twilio] FAILED to ${to}: ${err.message}`);
        throw err;
      }
    }

    case 'dev':
    default: {
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
  const text = `Your Naysan Home Health Care verification code is ${code}. It expires in ${ttl} minutes.`;
  // MSG91: the variable name must match the one in your DLT-approved template.
  const otpVar = process.env.MSG91_OTP_VAR || 'otp';
  return sendSms(phone, text, {
    templateId: process.env.MSG91_OTP_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID,
    variables: { [otpVar]: code, var1: code },
  });
}

module.exports = { sendSms, sendOtpSms, toE164, toMsg91Mobile };
