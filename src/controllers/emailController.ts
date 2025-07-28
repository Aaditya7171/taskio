import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse } from '../types';
import { sendVerificationEmail } from '../services/emailService';
import crypto from 'crypto';

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendEmailVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = req.user!;

    // Check if email is already verified
    if (user.email_verified) {
      res.status(400).json({
        success: false,
        error: 'Email is already verified'
      } as ApiResponse);
      return;
    }

    // Generate OTP and expiration time (10 minutes from now)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with verification token and expiration
    await query(
      `UPDATE users
       SET email_verification_token = $1, email_verification_expires = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [otp, expiresAt, userId]
    );

    // Send verification email
    await sendVerificationEmail(user.email, otp, user.name);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification email'
    } as ApiResponse);
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { otp } = req.body;

    if (!otp) {
      res.status(400).json({
        success: false,
        error: 'OTP is required'
      } as ApiResponse);
      return;
    }

    // Get user with verification token
    const result = await query(
      `SELECT email_verification_token, email_verification_expires, email_verified 
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

    // Check if already verified
    if (user.email_verified) {
      res.status(400).json({
        success: false,
        error: 'Email is already verified'
      } as ApiResponse);
      return;
    }

    // Check if OTP exists
    if (!user.email_verification_token) {
      res.status(400).json({
        success: false,
        error: 'No verification code found. Please request a new one.'
      } as ApiResponse);
      return;
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.email_verification_expires)) {
      res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new one.'
      } as ApiResponse);
      return;
    }

    // Check if OTP matches
    if (user.email_verification_token !== otp) {
      res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      } as ApiResponse);
      return;
    }

    // Mark email as verified and clear verification token
    await query(
      `UPDATE users 
       SET email_verified = TRUE, 
           email_verification_token = NULL, 
           email_verification_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Email verified successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    } as ApiResponse);
  }
};

export const updateTaskReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'enabled must be a boolean value'
      } as ApiResponse);
      return;
    }

    // If trying to enable reminders, check if email is verified
    if (enabled) {
      const result = await query(
        'SELECT email_verified FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        } as ApiResponse);
        return;
      }

      if (!result.rows[0].email_verified) {
        res.status(400).json({
          success: false,
          error: 'Email must be verified to enable task reminders',
          code: 'EMAIL_NOT_VERIFIED'
        } as ApiResponse);
        return;
      }
    }

    // Update task reminders setting
    await query(
      `UPDATE users 
       SET task_reminders_enabled = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [enabled, userId]
    );

    res.json({
      success: true,
      message: `Task reminders ${enabled ? 'enabled' : 'disabled'} successfully`
    } as ApiResponse);
  } catch (error) {
    console.error('Update task reminders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task reminders setting'
    } as ApiResponse);
  }
};

export const getEmailVerificationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await query(
      'SELECT email_verified, task_reminders_enabled FROM users WHERE id = $1',
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

    res.json({
      success: true,
      data: {
        email_verified: user.email_verified,
        task_reminders_enabled: user.task_reminders_enabled
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Get email verification status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get email verification status'
    } as ApiResponse);
  }
};
