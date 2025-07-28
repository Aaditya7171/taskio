import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse, Task, TaskFilters } from '../types';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const filters: TaskFilters = req.query;

    let whereClause = 'WHERE user_id = $1';
    const values: any[] = [userId];
    let paramCount = 2;

    // Apply filters
    if (filters.status) {
      whereClause += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters.priority) {
      whereClause += ` AND priority = $${paramCount++}`;
      values.push(filters.priority);
    }

    if (filters.due_date_from) {
      whereClause += ` AND due_date >= $${paramCount++}`;
      values.push(filters.due_date_from);
    }

    if (filters.due_date_to) {
      whereClause += ` AND due_date <= $${paramCount++}`;
      values.push(filters.due_date_to);
    }

    if (filters.search) {
      whereClause += ` AND (title ILIKE $${paramCount++} OR description ILIKE $${paramCount++})`;
      const searchPattern = `%${filters.search}%`;
      values.push(searchPattern, searchPattern);
      paramCount++;
    }

    const tasksQuery = `
      SELECT
        t.*,
        COALESCE(a.attachment_count, 0) as attachment_count,
        0 as journal_count,
        false as has_notes
      FROM tasks t
      LEFT JOIN (
        SELECT task_id, COUNT(*) as attachment_count
        FROM attachments
        GROUP BY task_id
      ) a ON t.id = a.task_id
      ${whereClause}
      ORDER BY
        CASE
          WHEN t.status = 'in_progress' THEN 1
          WHEN t.status = 'todo' THEN 2
          WHEN t.status = 'done' THEN 3
        END,
        CASE t.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
    `;

    const result = await query(tasksQuery, values);

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse<Task[]>);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tasks'
    } as ApiResponse);
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;

    const result = await query(
      `SELECT
        t.*,
        COALESCE(a.attachment_count, 0) as attachment_count,
        0 as journal_count,
        false as has_notes
      FROM tasks t
      LEFT JOIN (
        SELECT task_id, COUNT(*) as attachment_count
        FROM attachments
        GROUP BY task_id
      ) a ON t.id = a.task_id
      WHERE t.id = $1 AND t.user_id = $2`,
      [taskId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
      return;
    }

    // Get attachments
    const attachments = await query(
      'SELECT * FROM attachments WHERE task_id = $1 ORDER BY created_at DESC',
      [taskId]
    );

    // Get journals
    const journals = await query(
      'SELECT * FROM journals WHERE task_id = $1 ORDER BY created_at DESC',
      [taskId]
    );

    const taskWithDetails = {
      ...result.rows[0],
      attachments: attachments.rows,
      journals: journals.rows
    };

    res.json({
      success: true,
      data: taskWithDetails
    } as ApiResponse);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get task'
    } as ApiResponse);
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, description, due_date, priority = 'medium', status = 'todo' } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Title is required'
      } as ApiResponse);
      return;
    }

    const result = await query(
      `INSERT INTO tasks (user_id, title, description, due_date, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title.trim(), description || null, due_date || null, priority, status]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Task created successfully'
    } as ApiResponse<Task>);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    } as ApiResponse);
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;
    const { title, description, due_date, priority, status } = req.body;

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount++}`);
      values.push(due_date);
    }

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      values.push(priority);
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update'
      } as ApiResponse);
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(taskId, userId);

    const updateQuery = `
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount++} AND user_id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Task updated successfully'
    } as ApiResponse<Task>);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    } as ApiResponse);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;

    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [taskId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    } as ApiResponse);
  }
};
