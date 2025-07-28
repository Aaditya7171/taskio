import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { validateUserUpdate } from '../middleware/validation';
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getUserStats,
  uploadProfilePicture,
  changePassword,
  toggle2FA
} from '../controllers/userController';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users/profile - Get user profile
router.get('/profile', getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', validateUserUpdate, updateProfile);

// POST /api/users/profile-picture - Upload profile picture
router.post('/profile-picture', upload.single('profilePicture'), uploadProfilePicture);

// DELETE /api/users/profile - Delete user profile
router.delete('/profile', deleteProfile);

// GET /api/users/stats - Get user statistics
router.get('/stats', getUserStats);

// POST /api/users/change-password - Change user password
router.post('/change-password', changePassword);

// POST /api/users/toggle-2fa - Toggle two-factor authentication
router.post('/toggle-2fa', toggle2FA);

export default router;
