const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const College = require('../models/College');
const Year = require('../models/Year');
const Department = require('../models/Department');
const Hostel = require('../models/Hostel');
const RoomType = require('../models/RoomType');
const Category = require('../models/Category');
const Fee = require('../models/Fee');
const SplitFeePermission = require('../models/SplitFeePermission');
const Setting = require('../models/Setting');
const Payment = require('../models/Payment');
const User = require('../models/User');

const router = express.Router();

// Middleware: Only admin
function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
}

// Add College
router.post('/college', auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  const college = new College({ name });
  await college.save();
  res.json(college);
});

// Add Year
router.post('/year', auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  const year = new Year({ name });
  await year.save();
  res.json(year);
});

// Add Department
router.post('/department', auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  const department = new Department({ name });
  await department.save();
  res.json(department);
});

// Add Hostel
router.post('/hostel', auth, adminOnly, async (req, res) => {
  const { name, type } = req.body;
  const hostel = new Hostel({ name, type });
  await hostel.save();
  res.json(hostel);
});

// Add Room Type
router.post('/room-type', auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  const roomType = new RoomType({ name });
  await roomType.save();
  res.json(roomType);
});

// Add Category
router.post('/category', auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  const category = new Category({ name });
  await category.save();
  res.json(category);
});

// Add Fee
router.post('/fee', auth, adminOnly, async (req, res) => {
  const { hostelYear, roomType, category, hostelName, studentType, amount, deposit } = req.body;
  const fee = new Fee({ hostelYear, roomType, category, hostelName, studentType, amount, deposit });
  await fee.save();
  res.json(fee);
});

// Grant split fee permission
router.post('/split-fee', auth, adminOnly, async (req, res) => {
  const { email, studentId } = req.body;
  if (!email && !studentId) return res.status(400).json({ message: 'Email or studentId required' });
  const perm = new SplitFeePermission({ email, studentId });
  await perm.save();
  res.json(perm);
});

// Revoke split fee permission
router.delete('/split-fee', auth, adminOnly, async (req, res) => {
  const { email, studentId } = req.body;
  if (!email && !studentId) return res.status(400).json({ message: 'Email or studentId required' });
  const perm = await SplitFeePermission.findOneAndDelete({ $or: [ { email }, { studentId } ] });
  if (!perm) return res.status(404).json({ message: 'Permission not found' });
  res.json({ message: 'Permission revoked' });
});

// Delete Hostel
router.delete('/hostel/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const hostel = await Hostel.findByIdAndDelete(id);
  if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
  res.json({ message: 'Hostel deleted' });
});

// Delete College
router.delete('/college/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const college = await College.findByIdAndDelete(id);
  if (!college) return res.status(404).json({ message: 'College not found' });
  res.json({ message: 'College deleted' });
});

// Edit Fee
router.put('/fee/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const fee = await Fee.findByIdAndUpdate(id, update, { new: true });
  if (!fee) return res.status(404).json({ message: 'Fee not found' });
  res.json(fee);
});

// Delete Fee
router.delete('/fee/:id', auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const fee = await Fee.findByIdAndDelete(id);
  if (!fee) return res.status(404).json({ message: 'Fee not found' });
  res.json({ message: 'Fee deleted' });
});

// Get Settings (Admin only)
router.get('/settings', auth, adminOnly, async (req, res) => {
  let setting = await Setting.findOne().sort({ updatedAt: -1 });
  if (!setting) {
    // Return defaults if no settings exist
    setting = {
      academicYears: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
      branches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
      castes: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      hostelYears: ['2025-2026', '2026-2027', '2027-2028'],
      roomTypes: ['2 Person Sharing', '3 Person Sharing'],
      admissionYears: ['2021', '2022', '2023', '2024', '2025'],
      installments: 2
    };
  }
  res.json(setting);
});

// Get Public Settings (for students)
router.get('/public-settings', async (req, res) => {
  let setting = await Setting.findOne().sort({ updatedAt: -1 });
  if (!setting) {
    // Return defaults if no settings exist
    setting = {
      academicYears: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
      branches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
      castes: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      hostelYears: ['2025-2026', '2026-2027', '2027-2028'],
      roomTypes: ['2 Person Sharing', '3 Person Sharing'],
      admissionYears: ['2021', '2022', '2023', '2024', '2025'],
      installments: 2
    };
  }
  res.json(setting);
});

// Save/Update Settings
router.post('/settings', auth, adminOnly, async (req, res) => {
  try {
    const update = req.body;
    // Atomically update or create the settings document
    const setting = await Setting.findOneAndUpdate(
      {},
      update,
      { new: true, upsert: true }
    );
    res.json({
      academicYears: setting.academicYears,
      branches: setting.branches,
      castes: setting.castes,
      hostelYears: setting.hostelYears,
      roomTypes: setting.roomTypes,
      admissionYears: setting.admissionYears,
      installments: setting.installments
    });
  } catch (err) {
    console.error('Error in /settings POST:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get all Fees (Admin only)
router.get('/fees', auth, adminOnly, async (req, res) => {
  const fees = await Fee.find();
  res.json(fees);
});

// Get public fees (for students)
router.get('/public-fees', async (req, res) => {
  try {
    const fees = await Fee.find();
    res.json(fees);
  } catch (error) {
    console.error('Error fetching public fees:', error);
    res.status(500).json({ message: 'Failed to fetch fees' });
  }
});

// Get all users (students) with college and hostel names
router.get('/users', auth, adminOnly, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get all payments for a student by studentId or email
router.get('/payments', auth, adminOnly, async (req, res) => {
  const { studentId, email } = req.query;
  let user;
  if (studentId) {
    user = await User.findOne({ studentId });
  } else if (email) {
    user = await User.findOne({ email });
  }
  if (!user) return res.json([]);
  const payments = await Payment.find({ userId: user._id });
  res.json(payments);
});

// Get all split fee permissions
router.get('/split-fee', auth, adminOnly, async (req, res) => {
  const permissions = await SplitFeePermission.find();
  res.json(permissions);
});

// Dashboard statistics for admin panel
router.get('/dashboard-stats', auth, adminOnly, async (req, res) => {
  try {
    const [totalStudents, totalColleges, totalHostels, payments] = await Promise.all([
      User.countDocuments(),
      College.countDocuments(),
      Hostel.countDocuments(),
      Payment.find({ status: 'success' }, 'amount')
    ]);
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    res.json({
      totalStudents,
      totalColleges,
      totalHostels,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
});

// Delete User (Student)
router.delete('/users/:studentId', auth, adminOnly, async (req, res) => {
  const { studentId } = req.params;
  const user = await User.findOneAndDelete({ studentId });
  if (!user) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

// Export students data to CSV
router.get('/export-students', auth, adminOnly, async (req, res) => {
  try {
    console.log('Export students request received');
    console.log('User from auth:', req.user);
    
    // Check if we can connect to database
    if (!mongoose.connection.readyState) {
      console.error('Database not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    // Get all students with their payments
    let students = [];
    try {
      students = await User.find().sort({ createdAt: -1 });
      console.log(`Found ${students.length} students`);
    } catch (studentError) {
      console.error('Error fetching students:', studentError);
      return res.status(500).json({ message: 'Error fetching students data', error: studentError.message });
    }
    
    // Get all payments - handle case where there might be no payments
    let allPayments = [];
    try {
      allPayments = await Payment.find({ status: 'success' }).populate('userId');
      console.log(`Found ${allPayments.length} successful payments`);
    } catch (paymentError) {
      console.error('Error fetching payments:', paymentError);
      allPayments = []; // Set empty array if payments fail
    }
    
    // Create CSV headers
    const headers = [
      'Student ID',
      'Name',
      'Email',
      'Contact Number',
      'College',
      'Academic Year',
      'Department',
      'Admission Year',
      'Student Type',
      'Category',
      'Hostel Type',
      'Hostel Name',
      'Room Type',
      'Hostel Year',
      'Total Fees',
      'Deposit Amount',
      'Split Fee Eligible',
      'Registration Date',
      'Payment 1 Date',
      'Payment 1 Amount',
      'Payment 1 Installment',
      'Payment 2 Date',
      'Payment 2 Amount',
      'Payment 2 Installment',
      'Payment 3 Date',
      'Payment 3 Amount',
      'Payment 3 Installment',
      'Total Paid Amount',
      'Remaining Amount',
      'Payment Status',
      'Last Payment Date',
      'Razorpay Payment IDs'
    ];

    // Create CSV rows
    const csvRows = [headers.join(',')];
    
    for (const student of students) {
      try {
        // Get payments for this student
        const studentPayments = allPayments.filter(p => p.userId && p.userId._id && p.userId._id.toString() === student._id.toString());
        
        // Sort payments by date
        studentPayments.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
        
        // Calculate payment details
        const totalPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const remainingAmount = ((student.fees || 0) + (student.deposit || 0)) - totalPaid;
        const paymentStatus = remainingAmount <= 0 ? 'Fully Paid' : remainingAmount < ((student.fees || 0) + (student.deposit || 0)) ? 'Partially Paid' : 'Not Paid';
        
        // Get payment details (up to 3 payments)
        const payment1 = studentPayments[0] || null;
        const payment2 = studentPayments[1] || null;
        const payment3 = studentPayments[2] || null;
        
        // Get all Razorpay payment IDs
        const razorpayIds = studentPayments
          .filter(p => p.razorpayPaymentId)
          .map(p => p.razorpayPaymentId)
          .join('; ');
        
        const lastPaymentDate = studentPayments.length > 0 
          ? new Date(studentPayments[studentPayments.length - 1].paymentDate).toLocaleDateString()
          : '';
      
              const row = [
          `"${student.studentId || ''}"`,
          `"${student.name || ''}"`,
          `"${student.email || ''}"`,
          `"${student.contactNo || ''}"`,
          `"${student.college || ''}"`,
          `"${student.year || ''}"`,
          `"${student.department || ''}"`,
          `"${student.admissionYear || ''}"`,
          `"${student.studentType || ''}"`,
          `"${student.category || ''}"`,
          `"${student.hostelType || ''}"`,
          `"${student.hostelName || ''}"`,
          `"${student.roomType || ''}"`,
          `"${student.hostelYear || ''}"`,
          student.fees || 0,
          student.deposit || 0,
          student.splitFee ? 'Yes' : 'No',
          `"${new Date(student.createdAt).toLocaleDateString()}"`,
          payment1 ? `"${new Date(payment1.paymentDate).toLocaleDateString()}"` : '',
          payment1 ? (payment1.amount || 0) : '',
          payment1 ? (payment1.installment || 1) : '',
          payment2 ? `"${new Date(payment2.paymentDate).toLocaleDateString()}"` : '',
          payment2 ? (payment2.amount || 0) : '',
          payment2 ? (payment2.installment || 2) : '',
          payment3 ? `"${new Date(payment3.paymentDate).toLocaleDateString()}"` : '',
          payment3 ? (payment3.amount || 0) : '',
          payment3 ? (payment3.installment || 3) : '',
          totalPaid,
          remainingAmount,
          `"${paymentStatus}"`,
          `"${lastPaymentDate}"`,
          `"${razorpayIds}"`
        ];
        
        csvRows.push(row.join(','));
      } catch (studentError) {
        console.error(`Error processing student ${student.studentId}:`, studentError);
        // Add a basic row for this student with error info
        const errorRow = [
          `"${student.studentId || 'ERROR'}"`,
          `"${student.name || 'ERROR'}"`,
          `"${student.email || 'ERROR'}"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          `"ERROR"`,
          0,
          0,
          'No',
          `"${new Date().toLocaleDateString()}"`,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          0,
          0,
          '"Error Processing"',
          '"Error"',
          '"Error"'
        ];
        csvRows.push(errorRow.join(','));
      }
    }
    
    console.log('CSV generation completed, rows:', csvRows.length);
    const csvContent = csvRows.join('\n');
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="students_data_${new Date().toISOString().split('T')[0]}.csv"`);
    
    console.log('Sending CSV response, content length:', csvContent.length);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting students data:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to export students data', 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Export detailed payment history to CSV
router.get('/export-payment-history', auth, adminOnly, async (req, res) => {
  try {
    console.log('Export payment history request received');
    
    // Get all payments with user details
    let payments = [];
    try {
      payments = await Payment.find({ status: 'success' })
        .populate('userId')
        .sort({ paymentDate: -1 });
      console.log(`Found ${payments.length} payments`);
    } catch (paymentError) {
      console.error('Error fetching payments:', paymentError);
      payments = [];
    }
    
    // Create CSV headers for payment history
    const headers = [
      'Payment ID',
      'Student ID',
      'Student Name',
      'Student Email',
      'College Name',
      'Payment Date',
      'Payment Amount',
      'Installment Number',
      'Payment Method',
      'Razorpay Payment ID',
      'Hostel Year',
      'Room Type',
      'Category',
      'Hostel Name',
      'Student Type',
      'Payment Status',
      'Created At'
    ];

    // Create CSV rows
    const csvRows = [headers.join(',')];
    
    for (const payment of payments) {
      try {
        const student = payment.userId;
        if (!student) {
          console.log('Skipping payment with no student:', payment._id);
          continue; // Skip if student not found
        }
        
        const row = [
          `"${payment._id}"`,
          `"${student.studentId || ''}"`,
          `"${student.name || ''}"`,
          `"${student.email || ''}"`,
          `"${student.college || ''}"`,
          `"${new Date(payment.paymentDate).toLocaleDateString()}"`,
          payment.amount || 0,
          payment.installment || 1,
          `"${payment.razorpayPaymentId ? 'Razorpay' : 'Manual'}"`,
          `"${payment.razorpayPaymentId || ''}"`,
          `"${payment.hostelYear || ''}"`,
          `"${payment.roomType || ''}"`,
          `"${payment.category || ''}"`,
          `"${payment.hostelName || ''}"`,
          `"${payment.studentType || ''}"`,
          `"${payment.status || ''}"`,
          `"${new Date(payment.createdAt).toLocaleDateString()}"`
        ];
        
        csvRows.push(row.join(','));
      } catch (paymentError) {
        console.error(`Error processing payment ${payment._id}:`, paymentError);
        // Skip this payment and continue with others
      }
    }
    
    const csvContent = csvRows.join('\n');
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payment_history_${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting payment history:', error);
    res.status(500).json({ message: 'Failed to export payment history', error: error.message });
  }
});

// Test endpoint to check admin access
router.get('/test', auth, adminOnly, async (req, res) => {
  try {
    res.json({ 
      message: 'Admin access working', 
      user: req.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Test failed', error: error.message });
  }
});

// TODO: Add edit/delete endpoints for each entity

module.exports = router; 