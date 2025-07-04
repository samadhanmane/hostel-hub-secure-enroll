const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER, // sender email
    pass: process.env.EMAIL_PASS, // sender email password or app password
  },
});

/**
 * Send an email with a PDF attachment to a single recipient
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} filename - Name for the PDF attachment
 */
async function sendReceiptEmail(to, subject, text, pdfBuffer, filename) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to, // only send to the provided address
    subject,
    text,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendReceiptEmail }; 