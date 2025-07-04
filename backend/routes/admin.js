const express = require('express');
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

// Get Settings
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

// Get all Fees
router.get('/fees', auth, adminOnly, async (req, res) => {
  const fees = await Fee.find();
  res.json(fees);
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

// TODO: Add edit/delete endpoints for each entity

module.exports = router; 