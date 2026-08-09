const { admin } = require('../config/firebase');
const nodemailer = require('nodemailer');
const UserInventory = require('../models/UserInventory.model');
const Notification = require('../models/Notification.model');

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!admin || !fcmToken) return false;

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data
    };
    await admin.messaging().send(message);
    return true;
  } catch (error) {
    console.error('Push Notification Error:', error.message);
    return false;
  }
};

const sendEmail = async (to, subject, htmlBody) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`Email mock sent to ${to}: ${subject}`);
    console.log(`Email Body: ${htmlBody}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@nutrivedic.com',
      to,
      subject,
      html: htmlBody
    });
    return true;
  } catch (error) {
    console.error('Email Error:', error.message);
    return false;
  }
};

const scheduleExpirationAlerts = async () => {
  try {
    // Find all users who have items expiring in <= 2 days where alert hasn't been sent
    const inventories = await UserInventory.find({
      'items': {
        $elemMatch: {
          daysRemaining: { $lte: 2, $gte: 0 },
          alertSent: false,
          status: { $ne: 'expired' }
        }
      }
    }).populate('userId', 'fcmToken email');

    for (const inventory of inventories) {
      const user = inventory.userId;
      
      const expiringItems = inventory.items.filter(item => 
        item.daysRemaining <= 2 && item.daysRemaining >= 0 && !item.alertSent && item.status !== 'expired'
      );

      for (const item of expiringItems) {
        const title = 'Food Expiration Alert ⚠️';
        const body = `Your ${item.itemName} is expiring in ${item.daysRemaining} days! Try to use it soon.`;
        
        let sentPush = false;
        if (user.fcmToken) {
          sentPush = await sendPushNotification(user.fcmToken, title, body, { type: 'expiration', itemId: item._id.toString() });
        }

        await Notification.create({
          userId: user._id,
          type: 'expiration_alert',
          title,
          message: body,
          channel: ['push', 'in_app'],
          sentVia: sentPush ? ['push', 'in_app'] : ['in_app']
        });

        item.alertSent = true;
      }
      
      await inventory.save();
    }
    console.log('Expiration alerts job completed');
  } catch (error) {
    console.error('Expiration Alerts Job Error:', error);
  }
};

module.exports = {
  sendPushNotification,
  sendEmail,
  scheduleExpirationAlerts
};
