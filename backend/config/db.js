const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      break;
    } catch (error) {
      console.error(`Error connecting to MongoDB (${retries} retries remaining): ${error.message}`);
      retries -= 1;
      if (retries === 0) {
        console.error('Could not connect to MongoDB after multiple attempts.');
      } else {
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection interrupted. Attempting reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message || err}`);
});

module.exports = connectDB;
