const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const DietPlan = require('../models/DietPlan.model');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutrivedic');
  
  const UserProfile = require('../models/UserProfile.model');
  const profiles = await UserProfile.find().limit(1);
  console.log("User Profile Conditions:", profiles[0]?.healthConditions);

  const plans = await DietPlan.find().sort({ createdAt: -1 }).limit(5);
  console.log("Latest Diet Plans:");
  plans.forEach(p => {
    console.log(`- ID: ${p._id}, Active: ${p.active}, Condition: ${p.condition}, CreatedAt: ${p.createdAt}`);
  });
  process.exit(0);
}

check();
