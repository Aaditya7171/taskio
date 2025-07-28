import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import taskRoutes from './tasks';
import habitRoutes from './habits';
import attachmentRoutes from './attachments';
import journalRoutes from './journals';
import analyticsRoutes from './analytics';
import emailRoutes from './email';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Taskio API is running',
    timestamp: new Date().toISOString()
  });
});



// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/journals', journalRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/email', emailRoutes);

export default router;
