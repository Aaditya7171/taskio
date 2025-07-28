import { body, query as expressQuery, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

// User validation
export const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('age')
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage('Age must be a valid number between 1 and 150'),
  body('profile_picture_url')
    .optional()
    .isURL()
    .withMessage('Profile picture URL must be a valid URL'),
  handleValidationErrors
];

// Task validation
export const validateTaskCreate = [
  body('title')
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  handleValidationErrors
];

export const validateTaskUpdate = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  handleValidationErrors
];

// Task query validation
export const validateTaskQuery = [
  expressQuery('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  expressQuery('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  expressQuery('due_date_from')
    .optional()
    .isISO8601()
    .withMessage('Due date from must be a valid ISO 8601 date'),
  expressQuery('due_date_to')
    .optional()
    .isISO8601()
    .withMessage('Due date to must be a valid ISO 8601 date'),
  expressQuery('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search query must not exceed 255 characters'),
  handleValidationErrors
];

// Journal validation
export const validateJournalCreate = [
  body('entry')
    .notEmpty()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Journal entry is required and must be between 1 and 5000 characters'),
  handleValidationErrors
];

// Habit validation
export const validateHabitCreate = [
  body('name')
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('Habit name is required and must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  handleValidationErrors
];

export const validateHabitUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Habit name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  handleValidationErrors
];
