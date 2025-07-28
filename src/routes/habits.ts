import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
// Cache middleware temporarily disabled for production deployment
// import { userCacheMiddleware, invalidateUserHabits } from '../middleware/cache';
import { validateHabitCreate, validateHabitUpdate } from '../middleware/validation';
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit
} from '../controllers/habitController';

const router = Router();

// All habit routes require authentication
router.use(authenticateToken);

// GET /api/habits - Get all habits
router.get('/', getHabits);

// POST /api/habits - Create a new habit
router.post('/', validateHabitCreate, createHabit);

// GET /api/habits/:id - Get a specific habit
router.get('/:id', getHabit);

// PUT /api/habits/:id - Update a habit
router.put('/:id', validateHabitUpdate, updateHabit);

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', deleteHabit);

// POST /api/habits/:id/complete - Mark habit as completed for today
router.post('/:id/complete', completeHabit);

export default router;
