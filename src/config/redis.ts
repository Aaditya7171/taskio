import { createClient } from 'redis';

// Redis client configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
  },
});

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('🚀 Redis client ready');
});

redisClient.on('end', () => {
  console.log('❌ Redis connection ended');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Continue without Redis if connection fails
  }
};

// Cache helper functions
export const cache = {
  // Get value from cache
  get: async (key: string): Promise<any> => {
    try {
      if (!redisClient.isOpen) {
        return null;
      }
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // Set value in cache with expiration
  set: async (key: string, value: any, expireInSeconds: number = 300): Promise<boolean> => {
    try {
      if (!redisClient.isOpen) {
        return false;
      }
      await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  // Delete key from cache
  del: async (key: string): Promise<boolean> => {
    try {
      if (!redisClient.isOpen) {
        return false;
      }
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key: string): Promise<boolean> => {
    try {
      if (!redisClient.isOpen) {
        return false;
      }
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },

  // Clear all cache
  flush: async (): Promise<boolean> => {
    try {
      if (!redisClient.isOpen) {
        return false;
      }
      await redisClient.flushAll();
      return true;
    } catch (error) {
      console.error('Redis FLUSH error:', error);
      return false;
    }
  }
};

// Initialize Redis connection
connectRedis();

export { redisClient, connectRedis };
export default cache;
