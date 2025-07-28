import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { User } from '../types';

export interface AuthRequest extends Request {
  user?: User;
  stackUser?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    let user: User | null = null;

    // Try JWT authentication
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

      if (decoded && decoded.userId) {
        const result = await query(
          'SELECT * FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      }
    } catch (jwtError: any) {
      // JWT failed, don't fall back to test user
      console.log('JWT verification failed:', jwtError?.message || 'Unknown error');
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
    return;
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        // Try JWT authentication
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

          if (decoded && decoded.userId) {
            const result = await query(
              'SELECT * FROM users WHERE id = $1',
              [decoded.userId]
            );

            if (result.rows.length > 0) {
              req.user = result.rows[0];
            }
          }
        } catch (jwtError: any) {
          // JWT failed, continue without auth
          console.log('JWT verification failed in optional auth:', jwtError?.message || 'Unknown error');
        }
      } catch (error) {
        // Invalid token, continue without auth
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};
