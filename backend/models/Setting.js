const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  academicYears: [String],
  branches: [String],
  castes: [String],
  hostelYears: [String],
  roomTypes: [String],
  admissionYears: [String],
  installments: { type: Number, default: 2 },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema); 