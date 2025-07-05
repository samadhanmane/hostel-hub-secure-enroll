const express = require('express');
const Fee = require('../models/Fee');
const SplitFeePermission = require('../models/SplitFeePermission');
const Payment = require('../models/Payment');
const User = require('../models/User');
// Remove the frontend student ID generator import since we'll use the backend one
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const { generateReceiptPdf } = require('../utils/receiptPdfGenerator');
const { sendReceiptEmail } = require('../utils/mailer');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper: Student ID generator with unique counter (same as in auth.js)
async function generateStudentId({ year, college, roomType, hostelName, hostelType, hostelYear }) {
  try {
    // Get current count of students for this year
    const yearCode = hostelYear.slice(0, 4);
    const existingStudents = await User.countDocuments({ 
      studentId: { $regex: `^${yearCode}` } 
    });
    
    // Academic year mapping
    const yearMapping = {
      'First Year': 'FY',
      'Second Year': 'SY', 
      'Third Year': 'TY',
      'Fourth Year': 'LY'
    };
    
    // College code (first 2 letters of each word, max 4 chars)
    const collegeCode = college
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    // Academic year code
    const academicCode = yearMapping[year] || 'FY';
    
    // Room type code (first 2 letters)
    const roomCode = roomType.substring(0, 2).toUpperCase();
    
    // Hostel type (B for boys, G for girls)
    const hostelCode = hostelType === 'boys' ? 'B' : 'G';
    
    // Unique counter (4 digits, padded with zeros)
    const counter = (existingStudents + 1).toString().padStart(4, '0');
    
    // Format: YYYY + ACADEMIC + COLLEGE + ROOM + HOSTEL + COUNTER
    // Example: 2025FYMA2B0001, 2025FYMA2B0002, etc.
    const studentId = `${yearCode}${academicCode}${collegeCode}${roomCode}${hostelCode}${counter}`;
    
    return studentId;
  } catch (error) {
    console.error('Error generating student ID:', error);
    // Fallback to timestamp-based ID if counting fails
    const timestamp = Date.now().toString().slice(-6);
    const yearCode = hostelYear.slice(0, 4);
    const academicCode = yearMapping[year] || 'FY';
    return `${yearCode}${academicCode}T${timestamp}`;
  }
}

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
    try {
      // Provide default values if any are missing
      const safeHostelYear = hostelYear || '0000-0000';
      const safeAcademicYear = academicYear || 'Unknown';
      const safeCollege = college || 'Unknown';
      const safeRoomCapacity = roomCapacity || 2;
      const safeHostelType = hostelType || 'unknown';
      
      // Generate unique student ID using the backend algorithm
      const studentId = await generateStudentId({ 
        year: safeAcademicYear, 
        college: safeCollege, 
        roomType: safeRoomCapacity.toString(), 
        hostelName: hostelName || 'Unknown', 
        hostelType: safeHostelType, 
        hostelYear: safeHostelYear 
      });
      
      // Check if student ID already exists (shouldn't happen with counter, but safety check)
      const existingUserWithId = await User.findOne({ studentId });
      if (existingUserWithId) {
        console.error('Student ID conflict detected:', { studentId, existingEmail: existingUserWithId.email, newEmail: email });
        return res.status(500).json({ message: 'Student ID generation conflict. Please try again.' });
      }
      
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
    } catch (error) {
      console.error('Error creating user during payment:', error);
      return res.status(500).json({ message: 'Failed to create user account', error: error.message });
    }
  }
  // Save payment
  let payment;
  try {
    payment = new Payment({
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
  } catch (error) {
    console.error('Error saving payment:', error);
    return res.status(500).json({ message: 'Failed to save payment', error: error.message });
  }

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
      
      // Send to student
      await sendReceiptEmail(email, subject, text, pdfBuffer, 'HostelHub_Receipt.pdf');
      
      // Send to admin if different from student
      if (process.env.RECEIPT_EMAIL && process.env.RECEIPT_EMAIL !== email) {
        await sendReceiptEmail(process.env.RECEIPT_EMAIL, subject, `Receipt for student: ${email}`, pdfBuffer, 'HostelHub_Receipt.pdf');
      }
    } catch (err) {
      console.error('Failed to send receipt email:', err.message);
    }
  })();
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  try {
    let safeReceipt = receipt;
    if (safeReceipt.length > 40) safeReceipt = safeReceipt.slice(0, 40);
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: safeReceipt,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message });
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

  // Find the fee structure for this user (case-insensitive)
  const fee = await Fee.findOne({
    hostelYear: new RegExp(`^${hostelYear}$`, 'i'),
    roomType: new RegExp(`^${roomType}$`, 'i'),
    category: new RegExp(`^${category}$`, 'i'),
    hostelName: new RegExp(`^${hostelName}$`, 'i'),
    studentType: new RegExp(`^${studentType}$`, 'i'),
  });
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

// Test email configuration
router.get('/test-email', async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        message: 'Email configuration missing',
        EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'missing',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'set' : 'missing'
      });
    }
    
    // Test email transport
    const testTransporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Verify credentials
    await testTransporter.verify();
    
    res.json({ 
      message: 'Email configuration is valid',
      EMAIL_USER: process.env.EMAIL_USER,
      RECEIPT_EMAIL: process.env.RECEIPT_EMAIL || 'not set'
    });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({ 
      message: 'Email configuration test failed',
      error: error.message,
      code: error.code
    });
  }
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