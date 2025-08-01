import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { testWelcomeEmail } from '../controllers/testController';

const router = Router();

// All test routes require authentication
router.use(authenticateToken);

// POST /api/test/welcome-email - Test welcome email
router.post('/welcome-email', testWelcomeEmail);

export default router;
