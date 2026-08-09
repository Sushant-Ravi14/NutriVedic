const admin = require('firebase-admin');

const initFirebase = () => {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('Firebase Admin initialized');
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
    }
  } else {
    console.log('Firebase config missing, Push Notifications will not work');
  }
};

module.exports = { admin, initFirebase };
