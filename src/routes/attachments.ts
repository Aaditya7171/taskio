import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  upload
} from '../controllers/attachmentController';

const router = Router();

// All attachment routes require authentication
router.use(authenticateToken);

// POST /api/attachments/tasks/:taskId - Upload attachment to a task
router.post('/tasks/:taskId', upload.single('file'), uploadAttachment);

// GET /api/attachments/tasks/:taskId - Get all attachments for a task
router.get('/tasks/:taskId', getAttachments);

// DELETE /api/attachments/:id - Delete an attachment
router.delete('/:id', deleteAttachment);

export default router;
