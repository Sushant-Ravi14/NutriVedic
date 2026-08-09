const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: Schema.Types.Mixed,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
