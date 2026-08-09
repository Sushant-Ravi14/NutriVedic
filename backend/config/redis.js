const redis = require('redis');

let redisClient;

const initRedis = async () => {
  if (process.env.REDIS_URL) {
    redisClient = redis.createClient({ url: process.env.REDIS_URL });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis connected'));

    try {
      await redisClient.connect();
    } catch (err) {
      console.error('Failed to connect to Redis, falling back to memory cache', err);
      redisClient = null;
    }
  } else {
    console.log('No REDIS_URL provided, falling back to memory cache (mock implementation not provided here)');
  }
};

const getRedisClient = () => redisClient;

module.exports = { initRedis, getRedisClient };
