const { getRedisClient } = require('../config/redis');

const setCache = async (key, value, durationInSeconds = 3600) => {
  const redisClient = getRedisClient();
  if (!redisClient) return false;
  
  try {
    await redisClient.setEx(key, durationInSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis Set Error:', error);
    return false;
  }
};

const getCache = async (key) => {
  const redisClient = getRedisClient();
  if (!redisClient) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis Get Error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  const redisClient = getRedisClient();
  if (!redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis Delete Error:', error);
    return false;
  }
};

module.exports = { setCache, getCache, deleteCache };
