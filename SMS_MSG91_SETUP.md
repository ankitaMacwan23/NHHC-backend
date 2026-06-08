# MSG91 OTP Setup — Naysan Home Health Care

This guide takes the app's OTP from **dev mode** (code printed in server logs) to
**real SMS** via MSG91. The code is already wired (`services/sms.js`) — you only
create the accounts, get the DLT template approved, and paste 4–5 values into Render.

> ⏱️ **Expected time: ~2–5 working days**, almost all of it waiting on DLT/template
> approval (a government requirement for sending OTP to +91 numbers). Coding is done.

---

## Overview of what you'll do
1. Create an **MSG91** account.
2. Complete **DLT** registration (entity + header/sender + OTP template). MSG91 guides this.
3. Copy your **Auth Key**, **Template/Flow ID**, **Sender ID**, and the **OTP variable name**.
4. Paste them into **Render → Environment**.
5. Test — done.

---

## Step 1 — Create the MSG91 account
1. Go to **https://msg91.com** → Sign up (use your business email + the Naysan mobile number).
2. Verify email + mobile.
3. Add some balance (₹ — you can start small, e.g. ₹100–500, to test).

## Step 2 — DLT registration (one-time, the slow part)
DLT (Distributed Ledger Technology) is mandatory in India for transactional/OTP SMS.
MSG91 has a guided DLT section, or you register on an operator portal
(e.g. Jio TrueConnect, Airtel, Vodafone-Idea) and link it in MSG91.

You'll need:
- **GST / business proof** and **PAN** of Naysan Home Health Care.
- Authorized signatory details.

Register in this order:
1. **Entity (PE) registration** — registers the business. → gives an **Entity ID**.
2. **Header / Sender ID** — the 6-char sender shown to users. Suggested: **`NAYSAN`**.
   (Transactional/OTP headers are alphabetic, 6 letters.)
3. **Content Template** — the exact SMS text (see Step 3). → gives a **Template ID (DLT)**.

> Approvals: Entity ~1–2 days, Header ~1 day, Template a few hours–1 day.

## Step 3 — The OTP template to submit
The template **must match** the text the app sends. Submit this content
(variable shown as `{#var#}`, which is the DLT placeholder):

**Template type:** Service implicit / OTP
**Message:**
```
Your Naysan Home Health Care verification code is {#var#}. It expires in 5 minutes.
```

Notes:
- Keep the wording identical to what the backend sends (in `services/sms.js`,
  `sendOtpSms`). If you change one, change the other.
- `{#var#}` is the OTP code — exactly **one** variable.
- After approval you'll get a **DLT Template ID** and, inside MSG91, you create a
  **Flow** that maps a variable name to `{#var#}`. Note that **variable name**
  (e.g. `otp`) — you'll set it as `MSG91_OTP_VAR`.

## Step 4 — Get your credentials from MSG91
From the MSG91 dashboard:
- **Auth Key** — top-right profile / "Configuration → API". → `MSG91_AUTHKEY`
- **Flow / Template ID** — the Flow you created for the OTP template. → `MSG91_OTP_TEMPLATE_ID`
- **Sender ID** — `NAYSAN` (informational; the Flow already knows it).
- **OTP variable name** — the variable in your Flow that holds the code (default we use is `otp`). → `MSG91_OTP_VAR`

## Step 5 — Set environment variables on Render
Render dashboard → your backend service → **Environment** → add:

| Key | Value |
|---|---|
| `SMS_PROVIDER` | `msg91` |
| `MSG91_AUTHKEY` | *(your auth key)* |
| `MSG91_OTP_TEMPLATE_ID` | *(your Flow/Template ID)* |
| `MSG91_OTP_VAR` | `otp`  *(or whatever your Flow variable is named)* |
| `SMS_COUNTRY_CODE` | `+91` |

Then **Save** (Render auto-redeploys). No code change or app rebuild needed.

## Step 6 — Test
1. In the app, request an OTP (patient login, or Add Patient/Add Caregiver).
2. The real SMS should arrive on the phone within seconds.
3. If it doesn't, check **Render → Logs**:
   - `[sms:msg91] sent to 91XXXXXXXXXX (request_id=...)` → success.
   - `[sms:msg91] FAILED ...` → the logged MSG91 error tells you what's wrong
     (usually template/variable mismatch or insufficient balance).

---

## How it works in code (already done)
- `services/sms.js` → `SMS_PROVIDER=msg91` routes through MSG91's Flow API v5.
- `sendOtpSms(phone, code)` sends the code as the template variable
  (`{ [MSG91_OTP_VAR]: code }`), to the number formatted as `91XXXXXXXXXX`.
- To switch back to dev (logs only): set `SMS_PROVIDER=dev`.
- To switch to Twilio later: set `SMS_PROVIDER=twilio` + `TWILIO_*` vars.

## Optional later — approval/rejection SMS via MSG91
The caregiver approve/reject notifications send free text today. Under MSG91 those
need their **own DLT templates** (with a name variable). Until then they're safely
skipped (logged as a warning) and never block the admin action. Tell me when you
want those and I'll wire their template IDs the same way.
