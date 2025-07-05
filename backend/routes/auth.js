const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Admin login attempt:', { 
    providedEmail: email, 
    expectedEmail: process.env.ADMIN_EMAIL,
    emailMatch: email === process.env.ADMIN_EMAIL,
    passwordMatch: password === process.env.ADMIN_PASSWORD
  });
  
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
    // Generate unique studentId
    const studentId = await generateStudentId({ year, college, roomType, hostelName, hostelType, hostelYear });
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

// Helper: Student ID generator with unique counter
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
    
    // Extract student name initials (first 3 letters)
    const nameParts = college.split(' ');
    const nameInitials = nameParts
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 3)
      .join('');
    
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
    
    console.log('Generated Student ID:', studentId, 'for student count:', existingStudents + 1);
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