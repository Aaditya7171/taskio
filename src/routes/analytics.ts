import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getProductivityInsights,
  getTaskTimeline,
  getWorkloadAnalysis
} from '../controllers/analyticsController';

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// GET /api/analytics/insights - Get productivity insights
router.get('/insights', getProductivityInsights);

// GET /api/analytics/timeline - Get task timeline
router.get('/timeline', getTaskTimeline);

// GET /api/analytics/workload - Get workload analysis
router.get('/workload', getWorkloadAnalysis);

export default router;
