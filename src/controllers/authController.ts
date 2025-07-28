import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { ApiResponse, User } from '../types';
import { AuthRequest } from '../middleware/auth';
import { sendPasswordResetEmail, send2FAEmail } from '../services/emailService';
import { verifyGoogleToken } from '../utils/googleAuth';

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      } as ApiResponse);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, email_verified, task_reminders_enabled)
       VALUES ($1, $2, $3, FALSE, FALSE)
       RETURNING id, name, email, age, profile_picture_url, email_verified, task_reminders_enabled, created_at, updated_at`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    } as ApiResponse);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
      return;
    }

    // Find user by email
    const result = await query(
      `SELECT id, stack_user_id, name, email, password_hash, age, profile_picture_url,
              email_verified, task_reminders_enabled, two_factor_enabled, created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );

    console.log('🔍 User query result:', result.rows.length > 0 ? 'User found' : 'User not found');

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    const user = result.rows[0];

    // Check if password hash exists
    if (!user.password_hash) {
      console.error('Password hash is missing for user:', user.email);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Verify password
    console.log('🔑 Verifying password for user:', user.email);
    let isValidPassword = false;

    try {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('✅ Password verification completed:', isValidPassword ? 'Valid' : 'Invalid');
    } catch (bcryptError: any) {
      console.error('❌ Bcrypt comparison error:', bcryptError.message);
      res.status(500).json({
        success: false,
        error: 'Authentication error'
      } as ApiResponse);
      return;
    }

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled && user.email_verified) {
      // Generate OTP for 2FA
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await query(
        `UPDATE users
         SET otp_token = $1, otp_expires = $2, otp_purpose = '2fa_login', updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [otp, expiresAt, user.id]
      );

      // Send 2FA email
      await send2FAEmail(user.email, otp, user.name);

      res.json({
        success: true,
        data: {
          requires2FA: true,
          userId: user.id
        },
        message: '2FA code sent to your email'
      } as ApiResponse);
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    } as ApiResponse);
  } catch (error: any) {
    console.error('❌ Login error:', error.message);
    console.error('Error stack:', error.stack);

    // Handle specific database errors
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
      res.status(503).json({
        success: false,
        error: 'Database connection error. Please try again later.'
      } as ApiResponse);
    } else if (error.code === '28P01') {
      res.status(503).json({
        success: false,
        error: 'Database authentication failed'
      } as ApiResponse);
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to login'
      } as ApiResponse);
    }
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      } as ApiResponse);
      return;
    }

    // Verify current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
      return;
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token: newToken },
      message: 'Token refreshed successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Failed to refresh token'
    } as ApiResponse);
  }
};

export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      res.status(400).json({
        success: false,
        error: 'User ID and OTP are required'
      } as ApiResponse);
      return;
    }

    // Get user with OTP details
    const result = await query(
      `SELECT id, stack_user_id, name, email, age, profile_picture_url,
              email_verified, task_reminders_enabled, two_factor_enabled,
              otp_token, otp_expires, otp_purpose, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    const user = result.rows[0];

    // Check if OTP exists and is for 2FA
    if (!user.otp_token || user.otp_purpose !== '2fa_login') {
      res.status(400).json({
        success: false,
        error: 'No 2FA code found. Please try logging in again.'
      } as ApiResponse);
      return;
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.otp_expires)) {
      res.status(400).json({
        success: false,
        error: '2FA code has expired. Please try logging in again.'
      } as ApiResponse);
      return;
    }

    // Check if OTP matches
    if (user.otp_token !== otp) {
      res.status(400).json({
        success: false,
        error: 'Invalid 2FA code'
      } as ApiResponse);
      return;
    }

    // Clear OTP
    await query(
      `UPDATE users
       SET otp_token = NULL, otp_expires = NULL, otp_purpose = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove sensitive fields from response
    const { otp_token, otp_expires, otp_purpose, ...userWithoutSensitive } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutSensitive,
        token
      },
      message: '2FA verification successful'
    } as ApiResponse);
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify 2FA code'
    } as ApiResponse);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required'
      } as ApiResponse);
      return;
    }

    // Find user by email
    const result = await query(
      'SELECT id, name, email, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset code has been sent.'
      } as ApiResponse);
      return;
    }

    const user = result.rows[0];

    // Check if email is verified
    if (!user.email_verified) {
      res.status(400).json({
        success: false,
        error: 'Please verify your email address first'
      } as ApiResponse);
      return;
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await query(
      `UPDATE users
       SET otp_token = $1, otp_expires = $2, otp_purpose = 'forgot_password', updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [otp, expiresAt, user.id]
    );

    // Send password reset email
    await sendPasswordResetEmail(user.email, otp, user.name);

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    } as ApiResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send password reset code'
    } as ApiResponse);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Email, OTP, and new password are required'
      } as ApiResponse);
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      } as ApiResponse);
      return;
    }

    // Find user by email
    const result = await query(
      `SELECT id, name, email, otp_token, otp_expires, otp_purpose
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    const user = result.rows[0];

    // Check if OTP exists and is for password reset
    if (!user.otp_token || user.otp_purpose !== 'forgot_password') {
      res.status(400).json({
        success: false,
        error: 'No password reset code found. Please request a new one.'
      } as ApiResponse);
      return;
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.otp_expires)) {
      res.status(400).json({
        success: false,
        error: 'Password reset code has expired. Please request a new one.'
      } as ApiResponse);
      return;
    }

    // Check if OTP matches
    if (user.otp_token !== otp) {
      res.status(400).json({
        success: false,
        error: 'Invalid password reset code'
      } as ApiResponse);
      return;
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    await query(
      `UPDATE users
       SET password_hash = $1, otp_token = NULL, otp_expires = NULL, otp_purpose = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    } as ApiResponse);
  }
};

// Google Authentication
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { googleUser, idToken } = req.body;

    console.log('🔐 Google Auth request received for:', googleUser?.email);

    if (!googleUser || !idToken) {
      res.status(400).json({
        success: false,
        error: 'Google user data and ID token are required'
      } as ApiResponse);
      return;
    }

    const { uid, email, displayName, photoURL, emailVerified } = googleUser;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required from Google account'
      } as ApiResponse);
      return;
    }

    // Check if user already exists
    const existingUserResult = await query(
      'SELECT * FROM users WHERE email = $1 OR google_id = $2',
      [email, uid]
    );

    let user;

    if (existingUserResult.rows.length > 0) {
      // User exists, update Google info if needed
      user = existingUserResult.rows[0];

      console.log('✅ Existing user found:', email);

      // Update Google ID and profile picture if not set
      await query(
        `UPDATE users
         SET google_id = $1,
             profile_picture_url = COALESCE(profile_picture_url, $2),
             email_verified = CASE WHEN email_verified = false THEN $3 ELSE email_verified END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [uid, photoURL, emailVerified, user.id]
      );

      // Fetch updated user data
      const updatedUserResult = await query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
      );
      user = updatedUserResult.rows[0];

    } else {
      // Create new user
      console.log('🆕 Creating new user from Google Auth:', email);

      const userId = require('crypto').randomUUID();

      await query(
        `INSERT INTO users (
          id, google_id, name, email, profile_picture_url,
          email_verified, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [userId, uid, displayName, email, photoURL, emailVerified]
      );

      // Fetch the created user
      const newUserResult = await query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      user = newUserResult.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        authMethod: 'google'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove sensitive data
    const { password_hash, password_reset_token, password_reset_expires, otp_token, otp_expires, otp_purpose, ...safeUser } = user;

    console.log('✅ Google authentication successful for:', email);

    res.json({
      success: true,
      data: {
        user: safeUser,
        token,
        authMethod: 'google'
      },
      message: 'Google authentication successful'
    } as ApiResponse);

  } catch (error: any) {
    console.error('❌ Google authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    } as ApiResponse);
  }
};
