const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // boys/girls
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema); 