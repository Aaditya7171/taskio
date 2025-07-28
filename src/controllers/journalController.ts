import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse, Journal } from '../types';

export const getJournals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.taskId;

    // Verify task belongs to user
    const taskResult = await query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);

      return;
    }

    const result = await query(
      'SELECT * FROM journals WHERE task_id = $1 ORDER BY created_at DESC',
      [taskId]
    );

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse<Journal[]>);
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get journals'
    } as ApiResponse);
  }
};

export const createJournal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.taskId;
    const { entry } = req.body;

    // Verify task belongs to user
    const taskResult = await query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);

      return;
    }

    const result = await query(
      `INSERT INTO journals (task_id, entry)
       VALUES ($1, $2)
       RETURNING *`,
      [taskId, entry]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Journal entry created successfully'
    } as ApiResponse<Journal>);
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create journal entry'
    } as ApiResponse);
  }
};

export const updateJournal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const journalId = req.params.id;
    const { entry } = req.body;

    // Verify journal belongs to user's task
    const result = await query(
      `UPDATE journals 
       SET entry = $1
       FROM tasks t
       WHERE journals.id = $2 
         AND journals.task_id = t.id 
         AND t.user_id = $3
       RETURNING journals.*`,
      [entry, journalId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      } as ApiResponse);

      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Journal entry updated successfully'
    } as ApiResponse<Journal>);
  } catch (error) {
    console.error('Update journal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update journal entry'
    } as ApiResponse);
  }
};

export const deleteJournal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const journalId = req.params.id;

    // Verify journal belongs to user's task
    const result = await query(
      `DELETE FROM journals 
       USING tasks t
       WHERE journals.id = $1 
         AND journals.task_id = t.id 
         AND t.user_id = $2
       RETURNING journals.id`,
      [journalId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      } as ApiResponse);

      return;
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete journal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete journal entry'
    } as ApiResponse);
  }
};

export const getAllUserJournals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT j.*, t.title as task_title, t.status as task_status
       FROM journals j
       JOIN tasks t ON j.task_id = t.id
       WHERE t.user_id = $1
       ORDER BY j.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse);
  } catch (error) {
    console.error('Get all user journals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get journal entries'
    } as ApiResponse);
  }
};
