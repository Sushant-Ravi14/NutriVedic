require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initRedis, getRedisClient } = require('./config/redis');
const { cloudinary, initCloudinary } = require('./config/cloudinary');
const connectDB = require('./config/db');

async function runTests() {
  console.log('--- Starting Configuration Tests ---');

  // 1. Test Redis
  try {
    await initRedis();
    const redis = getRedisClient();
    if (redis) {
      await redis.set('test_key', 'working', { EX: 10 });
      const val = await redis.get('test_key');
      console.log('✅ Redis is connected and working (Value: ' + val + ')');
    } else {
      console.log('❌ Redis client failed to initialize');
    }
  } catch (err) {
    console.log('❌ Redis error:', err.message);
  }

  // 2. Test Cloudinary
  try {
    initCloudinary();
    if (cloudinary && cloudinary.config().cloud_name) {
      console.log('✅ Cloudinary initialized with Cloud Name: ' + cloudinary.config().cloud_name);
    } else {
      console.log('❌ Cloudinary failed to initialize. Check credentials.');
    }
  } catch (err) {
    console.log('❌ Cloudinary error:', err.message);
  }

  // 3. Test Gemini AI
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not found in .env');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent('Say exactly: "Gemini is connected"');
    console.log('✅ Gemini API is connected and responding: ' + result.response.text().trim());
  } catch (err) {
    console.log('❌ Gemini API error:', err.message);
  }

  // 4. Test MongoDB
  try {
    await connectDB();
    console.log('✅ MongoDB connection successful');
  } catch (err) {
    console.log('❌ MongoDB connection error:', err.message);
  }

  // 5. Test Sentry
  try {
    if (process.env.SENTRY_DSN) {
      console.log('✅ Sentry DSN is present.');
    } else {
      console.log('⚠️ Sentry DSN is missing or empty.');
    }
  } catch (err) {
    console.log('❌ Sentry error:', err.message);
  }
  
  // 6. Test Firebase
  try {
    const { initFirebase, admin } = require('./config/firebase');
    initFirebase();
    if (admin.app()) {
      console.log('✅ Firebase Admin initialized successfully for project: ' + admin.app().options.projectId);
    }
  } catch (err) {
    console.log('❌ Firebase error:', err.message);
  }
  
  console.log('--- Tests Completed ---');
  process.exit(0);
}

runTests();
