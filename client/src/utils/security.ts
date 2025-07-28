/**
 * Security utilities for input validation and sanitization
 */

// Regular expressions for validation
const PATTERNS = {
  // Only allow alphanumeric characters, spaces, and common punctuation
  TEXT: /^[a-zA-Z0-9\s.,!?'"()-]+$/,
  
  // Standard email format
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Password requirements: at least 8 chars, must include uppercase, lowercase, and number
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  
  // Only allow alphanumeric characters and common separators
  USERNAME: /^[a-zA-Z0-9._-]{3,30}$/,
  
  // Only allow numbers
  NUMERIC: /^[0-9]+$/,
  
  // ISO date format
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  
  // URL format
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
};

/**
 * Sanitizes text input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#96;');
};

/**
 * Validates input against a specific pattern
 * @param input - The input to validate
 * @param type - The type of validation to perform
 * @returns Boolean indicating if input is valid
 */
export const validateInput = (
  input: string, 
  type: keyof typeof PATTERNS
): boolean => {
  if (!input) return false;
  
  const pattern = PATTERNS[type];
  return pattern.test(input);
};

/**
 * Validates and sanitizes text input
 * @param input - The input to validate and sanitize
 * @returns Sanitized string if valid, empty string if invalid
 */
export const validateAndSanitizeText = (input: string): string => {
  if (!validateInput(input, 'TEXT')) {
    return '';
  }
  return sanitizeText(input);
};

/**
 * Validates email format
 * @param email - The email to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  return validateInput(email, 'EMAIL');
};

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns Boolean indicating if password meets requirements
 */
export const validatePassword = (password: string): boolean => {
  return validateInput(password, 'PASSWORD');
};

/**
 * Validates username format
 * @param username - The username to validate
 * @returns Boolean indicating if username is valid
 */
export const validateUsername = (username: string): boolean => {
  return validateInput(username, 'USERNAME');
};

/**
 * Validates date format (YYYY-MM-DD)
 * @param date - The date string to validate
 * @returns Boolean indicating if date format is valid
 */
export const validateDate = (date: string): boolean => {
  return validateInput(date, 'DATE');
};

/**
 * Validates URL format
 * @param url - The URL to validate
 * @returns Boolean indicating if URL is valid
 */
export const validateUrl = (url: string): boolean => {
  return validateInput(url, 'URL');
};

/**
 * Validates that input is numeric only
 * @param input - The input to validate
 * @returns Boolean indicating if input contains only numbers
 */
export const validateNumeric = (input: string): boolean => {
  return validateInput(input, 'NUMERIC');
};

/**
 * Generates a CSRF token for form submission
 * @returns CSRF token string
 */
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Stores CSRF token in session storage
 * @param token - The token to store
 */
export const storeCSRFToken = (token: string): void => {
  sessionStorage.setItem('csrf-token', token);
};

/**
 * Retrieves CSRF token from session storage
 * @returns The stored CSRF token or null if not found
 */
export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf-token');
};

export default {
  sanitizeText,
  validateInput,
  validateAndSanitizeText,
  validateEmail,
  validatePassword,
  validateUsername,
  validateDate,
  validateUrl,
  validateNumeric,
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken
};
