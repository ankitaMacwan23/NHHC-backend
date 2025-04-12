const PDFDocument = require('pdfkit');
const moment = require('moment');

const generateInvoice = (res, patient, caregivers, paymentDetails) => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe the PDF into the response
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${patient.patientName}.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .text('Patient Payment Invoice', { align: 'center' })
    .moveDown();

  // Patient Info
  doc
    .fontSize(12)
    .text(`Patient Name: ${patient.patientName}`)
    .text(`Patient ID: ${patient._id}`)
    .text(`Date: ${moment().format('DD-MM-YYYY')}`)
    .moveDown();

  // Table Header
  doc
    .fontSize(14)
    .text('Caregiver Details:', { underline: true })
    .moveDown();

  caregivers.forEach((entry, idx) => {
    doc
      .fontSize(12)
      .text(`#${idx + 1}`)
      .text(`Name: ${entry.caregiver?.name}`)
      .text(`Role: ${entry.caregiverRole}`)
      .text(`Date: ${moment(entry.date).format('DD-MM-YYYY')}`)
      .text(`Duty: ${entry.duty}`)
      .text(`Charge: ₹${entry.charge || 0}`)
      .moveDown();
  });

  // Totals
  doc
    .fontSize(12)
    .moveDown()
    .text(`Total: ₹${paymentDetails.total}`)
    .text(`Discount: ₹${paymentDetails.discount}`)
    .text(`Extra Charges: ₹${paymentDetails.extraCharges}`)
    .text(`Final Total: ₹${paymentDetails.finalTotal}`)
    .moveDown();

  // Footer
  doc
    .fontSize(10)
    .text('Thank you for your payment!', { align: 'center' });

  doc.end();
};

module.exports = generateInvoice;
