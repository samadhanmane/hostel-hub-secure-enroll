const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  receiptUrl: { type: String },
  status: { type: String, required: true }, // e.g., 'success', 'pending', 'failed'
  paymentDate: { type: Date, default: Date.now },
  installment: { type: Number, default: 1 }, // 1 for full, 2 for split, etc.
  razorpayPaymentId: { type: String },
  hostelYear: { type: String },
  roomType: { type: String },
  category: { type: String },
  hostelName: { type: String },
  studentType: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema); 