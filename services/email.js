// Provider-agnostic email sender (mirrors services/sms.js).
//
// Today: a "dev" sender that logs instead of sending, so the app works without
// SMTP credentials. Set EMAIL_PROVIDER=smtp + EMAIL_* env vars to send for real.
//
//   EMAIL_PROVIDER=smtp
//   EMAIL_HOST=smtp.gmail.com
//   EMAIL_PORT=587
//   EMAIL_SECURE=false           # true for port 465
//   EMAIL_USER=you@example.com
//   EMAIL_PASS=app-password
//   EMAIL_FROM="Naysan Home Health Care <you@example.com>"

const PROVIDER = process.env.EMAIL_PROVIDER || 'dev';

let nodemailer = null;
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  // Lazy-require so the dependency is only needed when actually sending.
  nodemailer = nodemailer || require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE) === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
}

// Send an email. `attachments` follows nodemailer's format:
//   [{ filename, content (Buffer), contentType }]
async function sendMail({ to, subject, text, html, attachments }) {
  if (!to) throw new Error('Recipient email is required.');

  if (PROVIDER === 'dev' || !process.env.EMAIL_USER) {
    // Dev mode: don't send, just log (NEVER use for real users).
    if (process.env.NODE_ENV === 'production') {
      console.warn('[email] WARNING: EMAIL_PROVIDER=dev (or EMAIL_USER unset) while NODE_ENV=production — no real email sent.');
    }
    console.log(`[email:dev] -> ${to}: "${subject}" (${(attachments || []).length} attachment(s))`);
    return { provider: 'dev', delivered: false };
  }

  const info = await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
    attachments,
  });
  return { provider: 'smtp', delivered: true, messageId: info.messageId };
}

module.exports = { sendMail };
