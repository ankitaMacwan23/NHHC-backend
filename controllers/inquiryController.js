const Inquiry = require('../models/inquiry');

// --------------------------------------------------------------------------
// Mobile/public: submit a Contact-Us inquiry.
// POST /inquiry   { name, mobile, email?, subject?, message }
// --------------------------------------------------------------------------
exports.createInquiry = async (req, res) => {
  try {
    const { name, mobile, email, subject, message } = req.body;

    if (!name || !mobile || !message) {
      return res.status(400).json({ success: false, message: 'Name, mobile and message are required.' });
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
    }

    const inquiry = await Inquiry.create({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email && email.trim() ? email.trim() : undefined,
      subject: subject && subject.trim() ? subject.trim() : 'General Inquiry',
      message: message.trim(),
    });

    return res.status(201).json({ success: true, message: 'Your message has been sent successfully.', inquiry });
  } catch (err) {
    console.error('createInquiry error:', err);
    return res.status(500).json({ success: false, message: 'Could not submit your message. Please try again.' });
  }
};

// --------------------------------------------------------------------------
// Admin: list all inquiries, newest first.
// GET /inquiry
// --------------------------------------------------------------------------
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return res.status(200).json({ inquiries });
  } catch (err) {
    console.error('getInquiries error:', err);
    return res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

// --------------------------------------------------------------------------
// Admin: update an inquiry's status (Solved / Unsolved).
// PATCH /inquiry/:id/status   { status }
// --------------------------------------------------------------------------
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Solved', 'Unsolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    return res.status(200).json({ success: true, message: `Inquiry marked as ${status}.`, inquiry });
  } catch (err) {
    console.error('updateInquiryStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update inquiry status.' });
  }
};
