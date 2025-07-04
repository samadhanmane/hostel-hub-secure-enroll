const mongoose = require('mongoose');

const splitFeePermissionSchema = new mongoose.Schema({
  email: { type: String },
  studentId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('SplitFeePermission', splitFeePermissionSchema); 