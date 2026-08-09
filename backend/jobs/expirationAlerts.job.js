const cron = require('node-cron');
const { scheduleExpirationAlerts } = require('../utils/notifications');

// Run every day at 8:00 AM IST (02:30 UTC)
const startExpirationAlertsJob = () => {
  cron.schedule('30 2 * * *', async () => {
    console.log('Running daily expiration alerts job...');
    await scheduleExpirationAlerts();
  }, {
    scheduled: true,
    timezone: "UTC" // Handling IST offset manually
  });
};

module.exports = { startExpirationAlertsJob };
