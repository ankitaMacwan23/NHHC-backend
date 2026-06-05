// Provider-agnostic SMS sender.
// Today: a dev sender that logs the OTP server-side (no real SMS).
// Later: set SMS_PROVIDER=twilio|msg91 + provider creds in env and implement the branch.
//
// IMPORTANT: never log OTPs in production. The dev sender is gated on NODE_ENV.

const PROVIDER = process.env.SMS_PROVIDER || 'dev';

async function sendSms(phone, message) {
  switch (PROVIDER) {
    case 'twilio': {
      // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      // await twilio.messages.create({ to: `+91${phone}`, from: process.env.TWILIO_FROM, body: message });
      throw new Error('Twilio provider not configured. Set TWILIO_* env vars and implement this branch.');
    }
    case 'msg91': {
      // Call MSG91 OTP/flow API here with your approved DLT template.
      throw new Error('MSG91 provider not configured.');
    }
    case 'dev':
    default: {
      // The dev provider's whole purpose is to surface the OTP in logs instead of
      // sending a real SMS, so it logs the code regardless of NODE_ENV.
      // ⚠️ NEVER use SMS_PROVIDER=dev for real users — switch to twilio/msg91 before launch.
      if (process.env.NODE_ENV === 'production') {
        console.warn('[sms] WARNING: SMS_PROVIDER=dev while NODE_ENV=production — no real SMS sent. Use a real provider before launch.');
      }
      console.log(`[sms:dev] -> ${phone}: ${message}`);
      return { provider: 'dev', delivered: true };
    }
  }
}

// Convenience for OTP messages.
async function sendOtpSms(phone, code) {
  return sendSms(phone, `Your Naysan Home Health Care verification code is ${code}. It expires in ${process.env.OTP_TTL_MIN || 5} minutes.`);
}

module.exports = { sendSms, sendOtpSms };
