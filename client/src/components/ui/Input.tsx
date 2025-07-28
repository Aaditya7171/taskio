import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon: Icon,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full py-2 rounded-lg border transition-all duration-200',
            'bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            Icon ? 'pl-10 pr-4' : 'px-4',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-dark-600',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
