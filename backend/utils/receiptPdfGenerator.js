const PDFDocument = require('pdfkit');

/**
 * Generate a payment receipt PDF as a Buffer
 * @param {Object} data - Receipt data (fields: paymentId, razorpayPaymentId, studentId, paid, installment, college, year, department, hostel, roomType, category, hostelYear)
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateReceiptPdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    doc.fontSize(18).text('Hostel Hub - Payment Receipt', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown(0.5);
    doc.moveTo(14, doc.y).lineTo(196, doc.y).stroke();
    doc.moveDown(1);

    const addRow = (label, value) => {
      doc.font('Helvetica-Bold').text(`${label}:`, { continued: true });
      doc.font('Helvetica').text(` ${value}`);
      doc.moveDown(0.2);
    };
    addRow('Payment ID', data.paymentId || '-');
    addRow('Razorpay Transaction ID', data.razorpayPaymentId || '-');
    addRow('Student ID', data.studentId || '-');
    addRow('Paid Amount', `INR ${data.paid}`);
    addRow('Installment', data.installment === 2 ? '1st of 2' : 'Full');
    addRow('College', data.college || '-');
    addRow('Year', data.year || '-');
    addRow('Department', data.department || '-');
    addRow('Hostel', data.hostel || '-');
    addRow('Room Type', data.roomType || '-');
    addRow('Category', data.category || '-');
    addRow('Hostel Year', data.hostelYear || '-');
    doc.end();
  });
}

module.exports = { generateReceiptPdf }; 