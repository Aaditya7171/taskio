import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse } from '../types';

// Get average rating and total count
export const getRatingStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_ratings
      FROM user_ratings
    `);

    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        averageRating: parseFloat(stats.average_rating) || 0,
        totalRatings: parseInt(stats.total_ratings) || 0
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rating statistics'
    } as ApiResponse);
  }
};

// Submit a rating
export const submitRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { rating } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      } as ApiResponse);
      return;
    }

    // Check if user has already rated
    const existingRating = await query(
      'SELECT id FROM user_ratings WHERE user_id = $1',
      [userId]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating
      await query(
        'UPDATE user_ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [rating, userId]
      );
    } else {
      // Insert new rating
      await query(
        'INSERT INTO user_ratings (user_id, rating) VALUES ($1, $2)',
        [userId, rating]
      );
    }

    // Get updated stats
    const statsResult = await query(`
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_ratings
      FROM user_ratings
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        averageRating: parseFloat(stats.average_rating) || 0,
        totalRatings: parseInt(stats.total_ratings) || 0
      },
      message: 'Rating submitted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit rating'
    } as ApiResponse);
  }
};

// Get user's rating
export const getUserRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await query(
      'SELECT rating FROM user_ratings WHERE user_id = $1',
      [userId]
    );

    const userRating = result.rows.length > 0 ? result.rows[0].rating : null;

    res.json({
      success: true,
      data: { rating: userRating }
    } as ApiResponse);
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user rating'
    } as ApiResponse);
  }
};
