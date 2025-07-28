import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Input from './Input';
import { cn } from '@/utils/cn';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({
  label,
  error,
  helperText,
  icon,
  className,
  id,
  showPasswordLabel = 'Show password',
  hidePasswordLabel = 'Hide password',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Theme-based colors
  const getColors = () => {
    if (isDark) {
      return {
        eyeColor: 'text-purple-400',
        hoverColor: 'text-pink-400',
        glowColor: 'rgba(177, 156, 217, 0.5)',
        hoverGlowColor: 'rgba(236, 72, 153, 0.7)'
      };
    } else {
      return {
        eyeColor: 'text-purple-600',
        hoverColor: 'text-pink-600',
        glowColor: 'rgba(124, 58, 237, 0.5)',
        hoverGlowColor: 'rgba(219, 39, 119, 0.7)'
      };
    }
  };

  const colors = getColors();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id || `password-input-${Math.random().toString(36).substr(2, 9)}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          id={id}
          className={cn('pr-16', className)}
          error={error}
          helperText={helperText}
          icon={icon}
          {...props}
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.button
            key={showPassword ? 'visible' : 'hidden'}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              filter: `drop-shadow(0 0 3px ${colors.glowColor})`
            }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 15 
            }}
            type="button"
            onClick={togglePasswordVisibility}
            className={cn(
              'absolute right-5 top-[35%] transform -translate-y-1/2',
              'p-1 rounded-full',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
              colors.eyeColor,
              'hover:scale-110 transition-all duration-200',
              'flex items-center justify-center',
              'w-6 h-6'
            )}
            aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
            title={showPassword ? hidePasswordLabel : showPasswordLabel}
            whileHover={{ 
              scale: 1.1,
              filter: `drop-shadow(0 0 5px ${colors.hoverGlowColor})`,
              className: colors.hoverColor
            }}
            whileTap={{ scale: 0.95 }}
          >
            {showPassword ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
            
            {/* Animated rays */}
            {showPassword && (
              <>
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "absolute w-1 h-1 rounded-full bg-gradient-to-r",
                        isDark ? "from-purple-400 to-pink-400" : "from-purple-600 to-pink-600"
                      )}
                      style={{
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'center',
                        transform: `rotate(${i * 60}deg) translateX(10px)`,
                      }}
                      animate={{
                        opacity: [0.7, 1, 0.7],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              </>
            )}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
});

export default PasswordInput;
