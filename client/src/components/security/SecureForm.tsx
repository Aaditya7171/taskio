import React, { useEffect, useState } from 'react';
import { generateCSRFToken, storeCSRFToken, getCSRFToken } from '@/utils/security';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

/**
 * A secure form component that adds CSRF protection
 * and other security measures to form submissions
 */
const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  className
}) => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Generate and store CSRF token on mount
  useEffect(() => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    setCsrfToken(token);
  }, []);

  // Handle form submission with security checks
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify CSRF token
    const storedToken = getCSRFToken();
    if (!storedToken || storedToken !== csrfToken) {
      console.error('CSRF token validation failed');
      return;
    }

    // Rate limiting check (prevent form spam)
    const lastSubmitTime = sessionStorage.getItem('last-form-submit');
    const currentTime = Date.now();
    
    if (lastSubmitTime) {
      const timeSinceLastSubmit = currentTime - parseInt(lastSubmitTime);
      
      // Limit to one submission per second
      if (timeSinceLastSubmit < 1000) {
        console.error('Form submission rate limit exceeded');
        return;
      }
    }
    
    // Update last submit time
    sessionStorage.setItem('last-form-submit', currentTime.toString());

    // Call the original onSubmit handler
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Hidden CSRF token field */}
      <input type="hidden" name="csrf-token" value={csrfToken} />
      
      {children}
    </form>
  );
};

export default SecureForm;
