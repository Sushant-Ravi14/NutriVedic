const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profilePictureUrl: String,
  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  subscriptionTier: { type: String, enum: ['free','premium'], default: 'free' },
  subscriptionActive: { type: Boolean, default: false },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  accountStatus: { type: String, enum: ['active','suspended','deleted'], default: 'active' },
  refreshToken: String,
  emailOtp: String,
  emailOtpExpiry: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  fcmToken: String,
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
