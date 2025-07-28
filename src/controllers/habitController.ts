import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse, Habit } from '../types';

export const getHabits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT h.*, 
        CASE 
          WHEN h.last_completed IS NOT NULL AND h.last_completed::date = CURRENT_DATE 
          THEN true 
          ELSE false 
        END as completed_today
       FROM habits h
       WHERE h.user_id = $1
       ORDER BY h.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse<Habit[]>);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get habits'
    } as ApiResponse);
  }
};

export const getHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const habitId = req.params.id;

    const result = await query(
      `SELECT h.*, 
        CASE 
          WHEN h.last_completed IS NOT NULL AND h.last_completed::date = CURRENT_DATE 
          THEN true 
          ELSE false 
        END as completed_today
       FROM habits h
       WHERE h.id = $1 AND h.user_id = $2`,
      [habitId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Habit not found'
      } as ApiResponse);
      return;
    }

    // Get completion history for the last 30 days
    const completions = await query(
      `SELECT completed_date 
       FROM habit_completions 
       WHERE habit_id = $1 
         AND completed_date >= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY completed_date DESC`,
      [habitId]
    );

    const habitWithHistory = {
      ...result.rows[0],
      completion_history: completions.rows
    };

    res.json({
      success: true,
      data: habitWithHistory
    } as ApiResponse);
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get habit'
    } as ApiResponse);
  }
};

export const createHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description } = req.body;

    const result = await query(
      `INSERT INTO habits (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, name, description]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Habit created successfully'
    } as ApiResponse<Habit>);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create habit'
    } as ApiResponse);
  }
};

export const updateHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const habitId = req.params.id;
    const { name, description } = req.body;

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update'
      } as ApiResponse);
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(habitId, userId);

    const updateQuery = `
      UPDATE habits 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount++} AND user_id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Habit not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Habit updated successfully'
    } as ApiResponse<Habit>);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update habit'
    } as ApiResponse);
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const habitId = req.params.id;

    const result = await query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id',
      [habitId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Habit not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Habit deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete habit'
    } as ApiResponse);
  }
};

export const completeHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const habitId = req.params.id;
    const today = new Date().toISOString().split('T')[0];

    // Check if habit exists and belongs to user
    const habitResult = await query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );

    if (habitResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Habit not found'
      } as ApiResponse);
      return;
    }

    // Check if already completed today
    const existingCompletion = await query(
      'SELECT id FROM habit_completions WHERE habit_id = $1 AND completed_date = $2',
      [habitId, today]
    );

    if (existingCompletion.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Habit already completed today'
      } as ApiResponse);
      return;
    }

    // Add completion record
    await query(
      'INSERT INTO habit_completions (habit_id, completed_date) VALUES ($1, $2)',
      [habitId, today]
    );

    // Calculate new streak
    const habit = habitResult.rows[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    
    if (habit.last_completed) {
      const lastCompletedDate = new Date(habit.last_completed).toISOString().split('T')[0];
      if (lastCompletedDate === yesterdayStr) {
        newStreak = habit.streak_count + 1;
      }
    }

    // Update habit with new streak and last completed date
    const updatedHabit = await query(
      `UPDATE habits 
       SET streak_count = $1, last_completed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [newStreak, habitId]
    );

    res.json({
      success: true,
      data: updatedHabit.rows[0],
      message: 'Habit completed successfully'
    } as ApiResponse<Habit>);
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete habit'
    } as ApiResponse);
  }
};
