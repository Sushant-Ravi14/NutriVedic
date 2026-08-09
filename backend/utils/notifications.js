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
    console.log(`[Email Mock] Sent to ${to}: ${subject} | ${htmlBody}`);
    return true;
  }

  try {
    const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('@gmail.com');
    const cleanPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    const transporterConfig = isGmail
      ? {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: cleanPass
          }
        }
      : {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_PORT == 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: cleanPass
          }
        };

    const transporter = nodemailer.createTransport(transporterConfig);

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html: htmlBody
    });

    console.log(`[Email Delivered] Successfully sent to ${to} via Gmail SMTP!`);
    return true;
  } catch (error) {
    console.error(`[Email Error] SMTP Delivery failed (${error.message}). Logging message: ${subject} | ${htmlBody}`);
    return false;
  }
};

const scheduleExpirationAlerts = async () => {
  try {
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
