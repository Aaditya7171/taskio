import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  sendEmailVerification,
  verifyEmail,
  updateTaskReminders,
  getEmailVerificationStatus
} from '../controllers/emailController';

const router = Router();

// All email routes require authentication
router.use(authenticateToken);

// POST /api/email/send-verification - Send email verification OTP
router.post('/send-verification', sendEmailVerification);

// POST /api/email/verify - Verify email with OTP
router.post('/verify', verifyEmail);

// PUT /api/email/task-reminders - Update task reminders setting
router.put('/task-reminders', updateTaskReminders);

// GET /api/email/status - Get email verification status
router.get('/status', getEmailVerificationStatus);

export default router;
