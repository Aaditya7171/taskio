import { Request, Response, NextFunction } from 'express';
import cache from '../config/redis';
import { AuthRequest } from './auth';

// Cache key generator
const generateCacheKey = (req: AuthRequest): string => {
  const userId = req.user?.id || 'anonymous';
  const method = req.method;
  const path = req.path;
  const query = JSON.stringify(req.query);
  return `cache:${userId}:${method}:${path}:${query}`;
};

// Generic cache middleware
export const cacheMiddleware = (expireInSeconds: number = 300) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);

    try {
      // Try to get from cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`🎯 Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache the response
      res.json = function(data: any) {
        // Cache the response
        cache.set(cacheKey, data, expireInSeconds).catch(err => {
          console.error('Failed to cache response:', err);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// User-specific cache middleware
export const userCacheMiddleware = (expireInSeconds: number = 600) => {
  return cacheMiddleware(expireInSeconds);
};

// Public cache middleware (for non-authenticated routes)
export const publicCacheMiddleware = (expireInSeconds: number = 1800) => {
  return cacheMiddleware(expireInSeconds);
};

// Cache invalidation middleware
export const invalidateCache = (patterns: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to invalidate cache on successful operations
    const invalidateCacheOnSuccess = function(data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache patterns
        patterns.forEach(pattern => {
          const cacheKey = pattern.replace(':userId', userId || 'anonymous');
          cache.del(cacheKey).catch(err => {
            console.error('Failed to invalidate cache:', err);
          });
        });
      }
      return data;
    };

    res.json = function(data: any) {
      invalidateCacheOnSuccess(data);
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      invalidateCacheOnSuccess(data);
      return originalSend.call(this, data);
    };

    next();
  };
};

// Specific cache invalidation patterns
export const invalidateUserTasks = invalidateCache([
  'cache::userId:GET:/api/tasks:{}',
  'cache::userId:GET:/api/tasks/stats:{}',
  'cache::userId:GET:/api/dashboard:{}',
]);

export const invalidateUserProfile = invalidateCache([
  'cache::userId:GET:/api/profile:{}',
  'cache::userId:GET:/api/auth/me:{}',
]);

export const invalidateUserHabits = invalidateCache([
  'cache::userId:GET:/api/habits:{}',
  'cache::userId:GET:/api/habits/stats:{}',
]);

export const invalidateUserNotes = invalidateCache([
  'cache::userId:GET:/api/notes:{}',
]);

// Cache warming functions
export const warmCache = {
  userTasks: async (userId: string) => {
    try {
      // Pre-warm common task queries
      const cacheKeys = [
        `cache:${userId}:GET:/api/tasks:{}`,
        `cache:${userId}:GET:/api/tasks/stats:{}`,
      ];
      
      // This would typically fetch and cache the data
      console.log(`🔥 Warming cache for user ${userId}:`, cacheKeys);
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }
};

export default cacheMiddleware;
