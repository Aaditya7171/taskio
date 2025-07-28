import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateJournalCreate } from '../middleware/validation';
import {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  getAllUserJournals
} from '../controllers/journalController';

const router = Router();

// All journal routes require authentication
router.use(authenticateToken);

// GET /api/journals - Get all user's journal entries
router.get('/', getAllUserJournals);

// GET /api/journals/tasks/:taskId - Get all journals for a task
router.get('/tasks/:taskId', getJournals);

// POST /api/journals/tasks/:taskId - Create a journal entry for a task
router.post('/tasks/:taskId', validateJournalCreate, createJournal);

// PUT /api/journals/:id - Update a journal entry
router.put('/:id', validateJournalCreate, updateJournal);

// DELETE /api/journals/:id - Delete a journal entry
router.delete('/:id', deleteJournal);

export default router;
