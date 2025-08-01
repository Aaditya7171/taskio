import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getRatingStats, submitRating, getUserRating } from '../controllers/ratingController';

const router = Router();

// Public route to get rating statistics
router.get('/stats', getRatingStats);

// Protected routes (require authentication)
router.use(authenticateToken);

// Submit or update user rating
router.post('/', submitRating);

// Get current user's rating
router.get('/user', getUserRating);

export default router;
