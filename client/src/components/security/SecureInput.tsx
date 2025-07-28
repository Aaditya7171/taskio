import React, { useState, useEffect } from 'react';
import { sanitizeText, validateInput } from '@/utils/security';
import Input from '@/components/ui/Input';
import { LucideIcon } from 'lucide-react';

interface SecureInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  validationType?: 'TEXT' | 'EMAIL' | 'PASSWORD' | 'USERNAME' | 'NUMERIC' | 'DATE' | 'URL';
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * A secure input component that automatically sanitizes input
 * and validates against common attack patterns
 */
const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(({
  label,
  error,
  helperText,
  icon,
  validationType = 'TEXT',
  onChange,
  onValidationChange,
  className,
  id,
  value,
  ...props
}, ref) => {
  const [inputValue, setInputValue] = useState<string>(value as string || '');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string>('');

  // Validate input when value changes
  useEffect(() => {
    if (inputValue) {
      const valid = validateInput(inputValue, validationType);
      setIsValid(valid);
      
      if (onValidationChange) {
        onValidationChange(valid);
      }

      if (!valid) {
        switch (validationType) {
          case 'EMAIL':
            setValidationError('Please enter a valid email address');
            break;
          case 'PASSWORD':
            setValidationError('Password must be at least 8 characters with uppercase, lowercase, and number');
            break;
          case 'USERNAME':
            setValidationError('Username can only contain letters, numbers, and .-_');
            break;
          case 'NUMERIC':
            setValidationError('Only numbers are allowed');
            break;
          case 'DATE':
            setValidationError('Please use YYYY-MM-DD format');
            break;
          case 'URL':
            setValidationError('Please enter a valid URL');
            break;
          default:
            setValidationError('Invalid input format');
        }
      } else {
        setValidationError('');
      }
    } else {
      setIsValid(true);
      setValidationError('');
      if (onValidationChange) {
        onValidationChange(true);
      }
    }
  }, [inputValue, validationType, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // For password fields, don't sanitize the input
    const sanitizedValue = props.type === 'password' ? rawValue : sanitizeText(rawValue);
    
    setInputValue(sanitizedValue);
    
    if (onChange) {
      onChange(sanitizedValue);
    }
  };

  return (
    <Input
      ref={ref}
      label={label}
      error={validationError || error}
      helperText={helperText}
      icon={icon}
      className={className}
      id={id}
      value={inputValue}
      onChange={handleChange}
      {...props}
    />
  );
});

export default SecureInput;
