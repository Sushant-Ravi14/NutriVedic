const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
  console.log('API Key prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT SET');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  try {
    const result = await model.generateContent('Say: WORKING');
    console.log('Gemini response:', result.response.text());
  } catch (err) {
    console.error('Gemini error:', err.message);
    console.error('Status:', err.status);
  }
}

test();
