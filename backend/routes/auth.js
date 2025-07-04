const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  // Optionally, create admin in DB if not exists
  let admin = await Admin.findOne({ email });
  if (!admin) {
    admin = new Admin({ email, password: await bcrypt.hash(password, 10) });
    await admin.save();
  }
  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// User register
router.post('/register', async (req, res) => {
  try {
    const { name, email, college, year, department, contactNo, hostelType, hostelName, roomType, admissionYear, studentType, category, hostelYear, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Generate studentId (example: 2025FYMA2B)
    const studentId = generateStudentId({ year, college, roomType, hostelName, hostelType, hostelYear });
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, studentId, college, year, department, contactNo, hostelType, hostelName, roomType, admissionYear, studentType, category, hostelYear, password: hashedPassword, fees: 0, deposit: 0 });
    await user.save();
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, studentId });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, studentId: user.studentId });
});

// Helper: Student ID generator
function generateStudentId({ year, college, roomType, hostelName, hostelType, hostelYear }) {
  // Example: 2025FYMA2B
  // You can customize this logic as needed
  const yearCode = hostelYear.slice(0, 4);
  const yearShort = year[0].toUpperCase();
  const collegeShort = college.split(' ').map(w => w[0].toUpperCase()).join('');
  const roomShort = roomType[0];
  const hostelShort = hostelName.split(' ')[0][0].toUpperCase();
  const typeShort = hostelType[0].toUpperCase();
  return `${yearCode}${yearShort}${collegeShort}${roomShort}${hostelShort}${typeShort}`;
}

// GET /student/by-email?email=...&studentId=...
router.get('/student/by-email', async (req, res) => {
  const { email, studentId } = req.query;
  if (!email && !studentId) {
    return res.status(400).json({ message: 'Email or studentId is required' });
  }
  const user = await User.findOne(email ? { email } : { studentId });
  if (!user) {
    return res.status(404).json({ message: 'Student not found' });
  }
  // Exclude password from response
  const { password, ...userData } = user.toObject();
  res.json(userData);
});

module.exports = router; 