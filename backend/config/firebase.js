const admin = require('firebase-admin');

const initFirebase = () => {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
      // BULLETPROOF PARSING: Extract only the base64 part and rebuild the PEM
      let rawKey = process.env.FIREBASE_PRIVATE_KEY.replace(/["']/g, "");
      let keyBody = rawKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\\n/g, '')
        .replace(/\s+/g, '');
        
      let formattedKey = rawKey; // fallback
      if (keyBody) {
        let chunks = keyBody.match(/.{1,64}/g);
        if (chunks) {
          formattedKey = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: formattedKey,
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

