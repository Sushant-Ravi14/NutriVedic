const User = require('../models/User.model');
const UserProfile = require('../models/UserProfile.model');
const MealLog = require('../models/MealLog.model');
const AuditLog = require('../models/AuditLog.model');

const downloadData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    const profile = await UserProfile.findOne({ userId: req.user._id });
    const mealLogs = await MealLog.find({ userId: req.user._id });

    const exportData = {
      user,
      profile,
      mealLogs
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="nutrivedic_data_export.json"');
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    next(error);
  }
};

const deleteData = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { accountStatus: 'deleted' });
    
    await AuditLog.create({
      userId: req.user._id,
      action: 'GDPR_DATA_DELETION_REQUEST',
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Account and personal data scheduled for permanent deletion in 30 days.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { downloadData, deleteData };
