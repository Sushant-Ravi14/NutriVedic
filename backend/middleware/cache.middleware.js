const { getRedisClient } = require('../config/redis');

const cacheResponse = (durationInSeconds) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const redisClient = getRedisClient();
    if (!redisClient) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await redisClient.get(key);
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      } else {
        res.sendResponse = res.json;
        res.json = (body) => {
          redisClient.setEx(key, durationInSeconds, JSON.stringify(body));
          res.sendResponse(body);
        };
        next();
      }
    } catch (error) {
      console.error('Redis Cache Error', error);
      next();
    }
  };
};

module.exports = { cacheResponse };
