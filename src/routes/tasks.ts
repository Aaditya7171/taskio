import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
// Cache middleware temporarily disabled for production deployment
// import { userCacheMiddleware, invalidateUserTasks } from '../middleware/cache';
import {
  validateTaskCreate,
  validateTaskUpdate,
  validateTaskQuery
} from '../middleware/validation';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// GET /api/tasks - Get all tasks with optional filters
router.get('/', validateTaskQuery, getTasks);

// POST /api/tasks - Create a new task
router.post('/', validateTaskCreate, createTask);

// GET /api/tasks/:id - Get a specific task
router.get('/:id', getTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', validateTaskUpdate, updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

export default router;
