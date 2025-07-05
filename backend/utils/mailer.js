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
      console.error('Email configuration missing:', {
        EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'missing',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'set' : 'missing'
      });
      throw new Error('Email configuration not found. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }

    console.log('Sending email to:', to, 'from:', process.env.EMAIL_USER);
    
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
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', { messageId: result.messageId, to });
    return result;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      to,
      from: process.env.EMAIL_USER
    });
    throw error;
  }
}

module.exports = { sendReceiptEmail }; 