const cron = require('node-cron');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { sendPushNotification } = require('../utils/notifications');

// Run every Sunday at 9:00 AM IST (03:30 UTC)
const startWeeklyReportJob = () => {
  cron.schedule('30 3 * * 0', async () => {
    console.log('Running weekly report job...');
    try {
      const activeUsers = await User.find({ accountStatus: 'active' });
      
      for (const user of activeUsers) {
        const title = 'Your Weekly Health Report 📊';
        const body = 'Your weekly summary is ready. Check your progress!';
        
        let sentPush = false;
        if (user.fcmToken) {
          sentPush = await sendPushNotification(user.fcmToken, title, body, { type: 'weekly_report' });
        }

        await Notification.create({
          userId: user._id,
          type: 'milestone',
          title,
          message: body,
          channel: ['push', 'in_app'],
          sentVia: sentPush ? ['push', 'in_app'] : ['in_app']
        });
      }
      console.log('Weekly report job completed');
    } catch (error) {
      console.error('Weekly Report Job Error:', error);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });
};

module.exports = { startWeeklyReportJob };
