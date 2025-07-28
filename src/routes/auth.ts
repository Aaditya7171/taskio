import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';
import {
  authRateLimit,
  validateEmail,
  validatePassword,
  validateName
} from '../middleware/security';
import { register, login, refreshToken, verify2FA, forgotPassword, resetPassword, googleAuth } from '../controllers/authController';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', [
  body('name')
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
], register);

// POST /api/auth/login - Login user
router.post('/login', [
  authRateLimit,
  validateEmail,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
], login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken);

// POST /api/auth/verify-2fa - Verify 2FA code
router.post('/verify-2fa', [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  handleValidationErrors
], verify2FA);

// POST /api/auth/forgot-password - Send password reset OTP
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
], forgotPassword);

// POST /api/auth/reset-password - Reset password with OTP
router.post('/reset-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors
], resetPassword);

// POST /api/auth/google - Google Authentication
router.post('/google', [
  authRateLimit,
  body('googleUser')
    .notEmpty()
    .withMessage('Google user data is required'),
  body('googleUser.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('googleUser.uid')
    .notEmpty()
    .withMessage('Google UID is required'),
  body('idToken')
    .notEmpty()
    .withMessage('ID token is required'),
  handleValidationErrors
], googleAuth);

export default router;
