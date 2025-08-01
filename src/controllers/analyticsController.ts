import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse, ProductivityInsight } from '../types';

export const getProductivityInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { days = 30 } = req.query;

    // Daily task completion over the specified period (using current timestamp)
    const dailyStats = await query(
      `SELECT
        DATE(created_at AT TIME ZONE 'UTC') as date,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        ROUND(
          COUNT(CASE WHEN status = 'done' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0),
          2
        ) as completion_rate
       FROM tasks
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at AT TIME ZONE 'UTC')
       ORDER BY date DESC`,
      [userId]
    );

    // Task completion by priority
    const priorityStats = await query(
      `SELECT 
        priority,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        ROUND(
          COUNT(CASE WHEN status = 'done' THEN 1 END) * 100.0 / COUNT(*), 
          2
        ) as completion_rate
       FROM tasks 
       WHERE user_id = $1 
         AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY priority
       ORDER BY 
         CASE priority
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
         END`,
      [userId]
    );

    // Most productive hours (based on task completion times with current timezone)
    const hourlyStats = await query(
      `SELECT
        EXTRACT(HOUR FROM updated_at AT TIME ZONE 'UTC') as hour,
        COUNT(*) as completed_tasks
       FROM tasks
       WHERE user_id = $1
         AND status = 'done'
         AND updated_at >= NOW() - INTERVAL '${days} days'
       GROUP BY EXTRACT(HOUR FROM updated_at AT TIME ZONE 'UTC')
       ORDER BY hour ASC`,
      [userId]
    );

    // Average task completion time (for tasks with due dates)
    const completionTimeStats = await query(
      `SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_completion_hours,
        COUNT(*) as tasks_with_completion_time
       FROM tasks 
       WHERE user_id = $1 
         AND status = 'done'
         AND due_date IS NOT NULL
         AND updated_at >= CURRENT_DATE - INTERVAL '${days} days'`,
      [userId]
    );

    // Streak information
    const streakStats = await query(
      `WITH daily_completions AS (
        SELECT DATE(updated_at) as completion_date
        FROM tasks 
        WHERE user_id = $1 AND status = 'done'
        GROUP BY DATE(updated_at)
        ORDER BY completion_date DESC
      ),
      streak_calculation AS (
        SELECT 
          completion_date,
          completion_date - ROW_NUMBER() OVER (ORDER BY completion_date DESC)::integer as streak_group
        FROM daily_completions
      )
      SELECT 
        COUNT(*) as current_streak
      FROM streak_calculation
      WHERE streak_group = (
        SELECT streak_group 
        FROM streak_calculation 
        WHERE completion_date = CURRENT_DATE
        LIMIT 1
      )`,
      [userId]
    );

    // Habit completion stats
    const habitStats = await query(
      `SELECT 
        h.name,
        h.streak_count,
        COUNT(hc.id) as total_completions,
        COUNT(CASE WHEN hc.completed_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_completions
       FROM habits h
       LEFT JOIN habit_completions hc ON h.id = hc.habit_id
       WHERE h.user_id = $1
       GROUP BY h.id, h.name, h.streak_count
       ORDER BY h.streak_count DESC`,
      [userId]
    );

    const insights = {
      daily_stats: dailyStats.rows,
      priority_stats: priorityStats.rows,
      hourly_stats: hourlyStats.rows,
      completion_time: completionTimeStats.rows[0],
      current_streak: streakStats.rows[0]?.current_streak || 0,
      habit_stats: habitStats.rows
    };

    res.json({
      success: true,
      data: insights
    } as ApiResponse);
  } catch (error) {
    console.error('Get productivity insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get productivity insights'
    } as ApiResponse);
  }
};

export const getTaskTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const values = [userId];
    let paramCount = 2;

    if (start_date) {
      dateFilter += ` AND (due_date >= $${paramCount++} OR created_at >= $${paramCount - 1})`;
      values.push(start_date as string);
    }

    if (end_date) {
      dateFilter += ` AND (due_date <= $${paramCount++} OR created_at <= $${paramCount - 1})`;
      values.push(end_date as string);
    }

    const timelineQuery = `
      SELECT 
        id,
        title,
        description,
        due_date,
        priority,
        status,
        created_at,
        updated_at,
        CASE 
          WHEN due_date IS NOT NULL THEN due_date
          ELSE created_at
        END as timeline_date
      FROM tasks 
      WHERE user_id = $1 ${dateFilter}
      ORDER BY timeline_date ASC
    `;

    const result = await query(timelineQuery, values);

    // Group tasks by date for timeline view
    const timelineData = result.rows.reduce((acc: any, task: any) => {
      const date = task.timeline_date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});

    res.json({
      success: true,
      data: timelineData
    } as ApiResponse);
  } catch (error) {
    console.error('Get task timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get task timeline'
    } as ApiResponse);
  }
};

export const getWorkloadAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Upcoming workload by week
    const weeklyWorkload = await query(
      `SELECT 
        DATE_TRUNC('week', due_date) as week_start,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks
       FROM tasks 
       WHERE user_id = $1 
         AND status != 'done'
         AND due_date IS NOT NULL
         AND due_date >= CURRENT_DATE
         AND due_date <= CURRENT_DATE + INTERVAL '8 weeks'
       GROUP BY DATE_TRUNC('week', due_date)
       ORDER BY week_start ASC`,
      [userId]
    );

    // Overdue tasks
    const overdueTasks = await query(
      `SELECT 
        COUNT(*) as overdue_count,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_overdue
       FROM tasks 
       WHERE user_id = $1 
         AND status != 'done'
         AND due_date < CURRENT_DATE`,
      [userId]
    );

    // Tasks due this week
    const thisWeekTasks = await query(
      `SELECT 
        COUNT(*) as due_this_week,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_this_week
       FROM tasks 
       WHERE user_id = $1 
         AND status != 'done'
         AND due_date >= DATE_TRUNC('week', CURRENT_DATE)
         AND due_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'`,
      [userId]
    );

    const workloadAnalysis = {
      weekly_workload: weeklyWorkload.rows,
      overdue_tasks: overdueTasks.rows[0],
      this_week_tasks: thisWeekTasks.rows[0]
    };

    res.json({
      success: true,
      data: workloadAnalysis
    } as ApiResponse);
  } catch (error) {
    console.error('Get workload analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workload analysis'
    } as ApiResponse);
  }
};
