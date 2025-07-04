const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  hostelYear: { type: String, required: true }, // e.g., 2025-26
  roomType: { type: String, required: true },
  category: { type: String, required: true },
  hostelName: { type: String, required: true },
  studentType: { type: String, required: true }, // new/existing
  amount: { type: Number, required: true },
  deposit: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema); 