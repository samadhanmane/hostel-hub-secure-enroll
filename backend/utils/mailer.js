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
  try {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration not found. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
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
    
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
}

module.exports = { sendReceiptEmail }; 