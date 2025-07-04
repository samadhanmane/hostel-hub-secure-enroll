const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/payment/split-status?email=...&studentId=...
router.get('/split-status', async (req, res) => {
  const { email, studentId } = req.query;
  if (!email && !studentId) return res.status(400).json({ message: 'Email or studentId is required' });
  const user = await User.findOne(email ? { email } : { studentId });
  if (!user) return res.status(404).json({ message: 'Student not found' });
  // For demo, treat user.splitFee as 'paid' (customize as needed)
  res.json({ paid: !!user.splitFee });
});

module.exports = router; 