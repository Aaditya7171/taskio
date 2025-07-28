import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

/**
 * Rate limiting middleware to prevent brute force attacks
 */
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // limit each IP to 20 requests per windowMs (increased for development)
  'Too many authentication attempts, please try again later'
);

export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests, please try again later'
);

export const feedbackRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // limit each IP to 3 feedback submissions per hour
  'Too many feedback submissions, please try again later'
);

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.emailjs.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#96;')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * SQL injection prevention patterns
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(--|\/\*|\*\/|;|'|"|`)/,
  /(\bOR\b|\bAND\b).*?[=<>]/i,
  /\b(WAITFOR|DELAY)\b/i,
  /\b(XP_|SP_)/i,
];

/**
 * Check for SQL injection attempts
 */
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(value));
    }

    if (Array.isArray(value)) {
      return value.some(checkForSQLInjection);
    }

    if (value && typeof value === 'object') {
      return Object.values(value).some(checkForSQLInjection);
    }

    return false;
  };

  // Check request body
  if (req.body && checkForSQLInjection(req.body)) {
    res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
    return;
  }

  // Check query parameters
  if (req.query && checkForSQLInjection(req.query)) {
    res.status(400).json({
      success: false,
      error: 'Invalid query parameters detected'
    });
    return;
  }

  next();
};

/**
 * Validation middleware for common input types
 */
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const validatePassword = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number');

export const validateName = body('name')
  .isLength({ min: 2, max: 100 })
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes');

export const validateText = (fieldName: string, maxLength: number = 1000) => 
  body(fieldName)
    .optional()
    .isLength({ max: maxLength })
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]*$/)
    .withMessage(`${fieldName} contains invalid characters or exceeds ${maxLength} characters`);

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
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

/**
 * CSRF protection middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET requests and OPTIONS requests (for CORS preflight)
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    next();
    return;
  }

  // Skip CSRF for all API endpoints during development
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }

  const token = req.headers['x-csrf-token'] || req.body['csrf-token'];

  if (!token) {
    res.status(403).json({
      success: false,
      error: 'CSRF token missing'
    });
    return;
  }

  // In a production environment, you would validate the token against a stored value
  // For now, we'll just check that it exists and has a reasonable format
  if (typeof token !== 'string' || token.length < 10) {
    res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
    return;
  }

  next();
};

export default {
  authRateLimit,
  generalRateLimit,
  feedbackRateLimit,
  securityHeaders,
  sanitizeInput,
  preventSQLInjection,
  validateEmail,
  validatePassword,
  validateName,
  validateText,
  handleValidationErrors,
  csrfProtection
};
