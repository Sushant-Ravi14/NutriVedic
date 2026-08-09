const Notification = require('../models/Notification.model');
const UserProfile = require('../models/UserProfile.model');
const User = require('../models/User.model');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id, read: false })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true, readAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { mealRemindersEnabled, reminderTimes } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { mealRemindersEnabled, reminderTimes },
      { new: true }
    );
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const saveFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.status(200).json({ success: true, message: 'FCM Token saved' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllRead, deleteNotification, updateSettings, saveFCMToken };
