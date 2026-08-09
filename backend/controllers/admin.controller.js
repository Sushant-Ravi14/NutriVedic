const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');
const Notification = require('../models/Notification.model');
const { sendPushNotification } = require('../utils/notifications');

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const users = await User.find().select('-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const editUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    
    await AuditLog.create({
      adminId: req.user._id,
      userId: req.params.userId,
      action: 'ADMIN_EDIT_USER',
      details: Object.keys(req.body)
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { accountStatus: 'deleted' });
    
    await AuditLog.create({
      adminId: req.user._id,
      userId: req.params.userId,
      action: 'ADMIN_DELETE_USER'
    });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ subscriptionTier: 'premium' });
    
    res.status(200).json({ success: true, data: { totalUsers, premiumUsers } });
  } catch (error) {
    next(error);
  }
};

const broadcastAnnouncement = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    
    // In real app, this should be a background job using FCM topic
    // For now, log the audit
    await AuditLog.create({
      adminId: req.user._id,
      action: 'ADMIN_BROADCAST',
      details: { title, message }
    });

    res.status(200).json({ success: true, message: 'Broadcast initiated' });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, editUser, deleteUser, getAnalytics, broadcastAnnouncement, getAuditLogs };
