const express = require('express');
const Fee = require('../models/Fee');
const SplitFeePermission = require('../models/SplitFeePermission');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { generateStudentId } = require('../utils/studentIdGenerator');
const Razorpay = require('razorpay');
const { generateReceiptPdf } = require('../utils/receiptPdfGenerator');
const { sendReceiptEmail } = require('../utils/mailer');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Calculate fee
router.post('/calculate', async (req, res) => {
  const { hostelYear, roomType, category, hostelName, studentType } = req.body;
  const fee = await Fee.findOne({ hostelYear, roomType, category, hostelName, studentType });
  if (!fee) return res.status(404).json({ message: 'Fee not found for selected options' });
  res.json({ amount: fee.amount, deposit: fee.deposit });
});

// Check split fee eligibility
router.post('/split-eligibility', async (req, res) => {
  const { email, studentId } = req.body;
  if (!email && !studentId) return res.json({ eligible: false });
  const query = [];
  if (email) query.push({ email });
  if (studentId) query.push({ studentId });
  const perm = await SplitFeePermission.findOne({ $or: query });
  res.json({ eligible: !!perm });
});

// Payment endpoint (Razorpay integration placeholder)
router.post('/pay', async (req, res) => {
  const {
    email,
    hostelYear,
    academicYear,
    college,
    roomCapacity,
    hostelType,
    amount,
    installment,
    name = '',
    department = '',
    contactNo = '',
    hostelName = '',
    roomType = '',
    admissionYear = '',
    studentType = '',
    category = '',
    deposit = 0,
    razorpayPaymentId = ''
  } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    // Log all arguments before generating student ID
    // Provide default values if any are missing
    const safeHostelYear = hostelYear || '0000-0000';
    const safeAcademicYear = academicYear || 'Unknown';
    const safeCollege = college || 'Unknown';
    const safeRoomCapacity = roomCapacity || 2;
    const safeHostelType = hostelType || 'unknown';
    // Generate student ID using the provided algorithm
    const studentId = generateStudentId(safeHostelYear, safeAcademicYear, safeCollege, safeRoomCapacity, safeHostelType);
    user = new User({
      email,
      studentId,
      college: safeCollege,
      year: safeAcademicYear,
      hostelType: safeHostelType,
      name,
      department,
      contactNo,
      hostelName,
      roomType,
      admissionYear,
      studentType,
      category,
      hostelYear: safeHostelYear,
      fees: amount,
      deposit,
      splitFee: false,
      password: 'notused', // placeholder
    });
    await user.save();
  } else {
    // Log existing user found
  }
  // Save payment
  const payment = new Payment({
    userId: user._id,
    amount,
    status: 'success',
    installment,
    razorpayPaymentId,
    hostelYear,
    roomType,
    category,
    hostelName,
    studentType,
  });
  await payment.save();

  // Respond to frontend immediately
  res.json({ success: true, paymentId: payment._id, studentId: user.studentId, razorpayPaymentId });

  // Generate and send receipt PDF via email in the background
  (async () => {
    try {
      const receiptData = {
        paymentId: payment._id.toString(),
        razorpayPaymentId,
        studentId: user.studentId,
        paid: amount,
        installment,
        college,
        year: academicYear,
        department,
        hostel: hostelType,
        roomType,
        category,
        hostelYear,
      };
      const pdfBuffer = await generateReceiptPdf(receiptData);
      const subject = 'Hostel Hub Payment Receipt';
      const text = 'Thank you for your payment. Please find your receipt attached.';
      // Send only to student
      await sendReceiptEmail(email, subject, text, pdfBuffer, 'HostelHub_Receipt.pdf');
      // Send only to RECEIPT_EMAIL if different from student
      if (process.env.RECEIPT_EMAIL && process.env.RECEIPT_EMAIL !== email) {
        await sendReceiptEmail(process.env.RECEIPT_EMAIL, subject, `Receipt for student: ${email}`, pdfBuffer, 'HostelHub_Receipt.pdf');
      }
    } catch (err) {
      console.error('Failed to send receipt email:', err);
    }
  })();
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  console.log('--- /api/fee/create-order called ---');
  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
  console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***set***' : '***missing***');
  console.log('Request body:', req.body);
  try {
    let safeReceipt = receipt;
    if (safeReceipt.length > 40) safeReceipt = safeReceipt.slice(0, 40);
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: safeReceipt,
    };
    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);
    res.json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Get remaining fee for a student
router.get('/remaining-fee', async (req, res) => {
  const { studentId, email } = req.query;
  let user;
  if (studentId) {
    user = await User.findOne({ studentId });
  } else if (email) {
    user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
  }
  if (!user) return res.status(404).json({ message: 'Student not found' });

  // Use query params if provided, otherwise fallback to user fields
  const hostelYear = req.query.hostelYear || user.hostelYear;
  const roomType = req.query.roomType || user.roomType;
  const category = req.query.category || user.category;
  const hostelName = req.query.hostelName || user.hostelName;
  const studentType = req.query.studentType || user.studentType;

  // Log the fields used for the fee query
  console.log('Fee lookup fields:', { hostelYear, roomType, category, hostelName, studentType });

  // Find the fee structure for this user (case-insensitive)
  const fee = await Fee.findOne({
    hostelYear: new RegExp(`^${hostelYear}$`, 'i'),
    roomType: new RegExp(`^${roomType}$`, 'i'),
    category: new RegExp(`^${category}$`, 'i'),
    hostelName: new RegExp(`^${hostelName}$`, 'i'),
    studentType: new RegExp(`^${studentType}$`, 'i'),
  });
  console.log('Fee found:', fee);
  if (!fee) return res.status(404).json({ message: 'Fee structure not found' });

  // Only sum payments for this structure
  const payments = await Payment.find({
    userId: user._id,
    status: 'success',
    hostelYear,
    roomType,
    category,
    hostelName,
    studentType,
  });
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = (fee.amount + (fee.deposit || 0)) - paidAmount;
  res.json({ total: fee.amount + (fee.deposit || 0), paid: paidAmount, remaining: Math.max(0, remaining) });
});

// Get payment history for a student
router.get('/payment-history', async (req, res) => {
  const { studentId, email } = req.query;
  let user;
  if (studentId) {
    user = await User.findOne({ studentId });
  } else if (email) {
    user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
  }
  if (!user) return res.status(404).json({ message: 'Student not found' });
  const payments = await Payment.find({ userId: user._id }).sort({ paymentDate: -1 });
  res.json(payments);
});

// Download receipt PDF by paymentId
router.get('/receipt/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const user = await User.findById(payment.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const receiptData = {
      paymentId: payment._id.toString(),
      razorpayPaymentId: payment.razorpayPaymentId,
      studentId: user.studentId,
      paid: payment.amount,
      installment: payment.installment,
      college: user.college,
      year: user.year,
      department: user.department,
      hostel: user.hostelType,
      roomType: payment.roomType,
      category: payment.category,
      hostelYear: payment.hostelYear,
    };
    const pdfBuffer = await generateReceiptPdf(receiptData);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="HostelHub_Receipt.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Failed to generate receipt PDF:', err);
    res.status(500).json({ message: 'Failed to generate receipt PDF' });
  }
});

module.exports = router; 