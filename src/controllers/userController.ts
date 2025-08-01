import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse, User } from '../types';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { uploadFile } from '../services/uploadService';
import { sendWelcomeAlertsEmail } from '../services/reminderService';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get fresh user data from database to include email verification fields
    const result = await query(
      `SELECT id, stack_user_id, name, email, age, profile_picture_url,
              email_verified, task_reminders_enabled, created_at, updated_at
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

    res.json({
      success: true,
      data: user
    } as ApiResponse<User>);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    } as ApiResponse);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, age, profile_picture_url } = req.body;

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (age !== undefined) {
      updateFields.push(`age = $${paramCount++}`);
      values.push(age);
    }

    if (profile_picture_url !== undefined) {
      updateFields.push(`profile_picture_url = $${paramCount++}`);
      values.push(profile_picture_url);
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update'
      } as ApiResponse);
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    } as ApiResponse<User>);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    } as ApiResponse);
  }
};

export const deleteProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Delete user (cascade will handle related records)
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete profile'
    } as ApiResponse);
  }
};

export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get task statistics
    const taskStats = await query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks
      FROM tasks 
      WHERE user_id = $1
    `, [userId]);

    // Get habit statistics
    const habitStats = await query(`
      SELECT 
        COUNT(*) as total_habits,
        AVG(streak_count) as average_streak,
        MAX(streak_count) as longest_streak
      FROM habits 
      WHERE user_id = $1
    `, [userId]);

    // Get recent activity (tasks completed in last 7 days)
    const recentActivity = await query(`
      SELECT DATE(updated_at) as date, COUNT(*) as completed_count
      FROM tasks 
      WHERE user_id = $1 
        AND status = 'done' 
        AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(updated_at)
      ORDER BY date DESC
    `, [userId]);

    const stats = {
      tasks: taskStats.rows[0],
      habits: habitStats.rows[0],
      recent_activity: recentActivity.rows
    };

    res.json({
      success: true,
      data: stats
    } as ApiResponse);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    } as ApiResponse);
  }
};

export const uploadProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as ApiResponse);
      return;
    }

    // Upload to Cloudinary
    const folder = `taskio/profile-pictures/${userId}`;
    const result = await uploadFile(file, folder);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to upload profile picture'
      } as ApiResponse);
      return;
    }

    // Update user's profile picture URL in database
    const dbResult = await query(
      'UPDATE users SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [result.url, userId]
    );

    if (dbResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: {
        profile_picture_url: result.url,
        user: dbResult.rows[0]
      },
      message: 'Profile picture uploaded successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile picture'
    } as ApiResponse);
  }
};

// Toggle task alerts/reminders
export const toggleTaskAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'enabled field must be a boolean'
      } as ApiResponse);
      return;
    }

    // Check if this is the first time enabling alerts
    const currentUserResult = await query(
      'SELECT alerts_enabled, alerts_activated_at FROM users WHERE id = $1',
      [userId]
    );

    const currentUser = currentUserResult.rows[0];
    const isFirstTimeEnabling = enabled && !currentUser.alerts_enabled;

    // Update user's alerts preference
    const result = await query(
      `UPDATE users
       SET
         alerts_enabled = $1,
         alerts_activated_at = CASE WHEN $1 = true AND alerts_activated_at IS NULL THEN CURRENT_TIMESTAMP ELSE alerts_activated_at END,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [enabled, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    const user = result.rows[0];

    // Send welcome email if alerts are being enabled for the first time
    if (isFirstTimeEnabling) {
      try {
        console.log(`📧 Sending welcome alerts email to ${user.email}...`);
        await sendWelcomeAlertsEmail(user.email, user.name);
        console.log(`✅ Welcome alerts email sent to ${user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send welcome alerts email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      data: {
        alerts_enabled: user.alerts_enabled,
        alerts_activated_at: user.alerts_activated_at
      },
      message: enabled ? 'Task alerts enabled successfully' : 'Task alerts disabled successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Toggle task alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle task alerts'
    } as ApiResponse);
  }
};

// Get user's alert preferences
export const getAlertPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await query(
      'SELECT alerts_enabled, alerts_activated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    const preferences = result.rows[0];

    res.json({
      success: true,
      data: preferences
    } as ApiResponse);
  } catch (error) {
    console.error('Get alert preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alert preferences'
    } as ApiResponse);
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      } as ApiResponse);
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      } as ApiResponse);
      return;
    }

    // Get user's current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
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

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      } as ApiResponse);
      return;
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    } as ApiResponse);
  }
};

export const toggle2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'Enabled status is required'
      } as ApiResponse);
      return;
    }

    // Check if user's email is verified (required for 2FA)
    const userResult = await query(
      'SELECT email_verified FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    const user = userResult.rows[0];

    if (enabled && !user.email_verified) {
      res.status(400).json({
        success: false,
        error: 'Email must be verified before enabling 2FA'
      } as ApiResponse);
      return;
    }

    // Update 2FA setting
    const result = await query(
      'UPDATE users SET two_factor_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING two_factor_enabled',
      [enabled, userId]
    );

    res.json({
      success: true,
      data: {
        two_factor_enabled: result.rows[0].two_factor_enabled
      },
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`
    } as ApiResponse);
  } catch (error) {
    console.error('Toggle 2FA error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update 2FA setting'
    } as ApiResponse);
  }
};
