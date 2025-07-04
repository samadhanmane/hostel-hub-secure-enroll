const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  college: { type: String, required: true },
  year: { type: String, required: true },
  department: { type: String, required: true },
  contactNo: { type: String, required: true },
  hostelType: { type: String, required: true }, // boys/girls
  hostelName: { type: String, required: true },
  roomType: { type: String, required: true },
  admissionYear: { type: String, required: true },
  studentType: { type: String, required: true }, // new/existing
  category: { type: String, required: true },
  hostelYear: { type: String, required: true },
  fees: { type: Number, required: true },
  deposit: { type: Number, required: true },
  splitFee: { type: Boolean, default: false },
  password: { type: String, required: true }, // hashed
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 