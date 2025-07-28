import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { googleAuthService } from '@/services/googleAuth';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleAuthButtonProps {
  mode: 'login' | 'signup';
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setGoogleUser } = useAuth();

  const handleGoogleAuth = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);

    try {
      console.log(`🔐 Starting Google ${mode}...`);

      // Always try popup first, with automatic fallback to redirect
      let result = await googleAuthService.signInWithPopup();

      // If result is just success (redirect case), don't process further
      if (result?.success && !result?.user) {
        console.log('🔄 Redirecting for Google authentication...');
        return; // The redirect will handle the rest
      }

      if (result?.success && result?.user) {
        console.log('✅ Google authentication successful');

        // Update AuthContext with Google user
        setGoogleUser(result.user);

        toast.success(
          mode === 'login'
            ? `Welcome back, ${result.user?.name || 'User'}!`
            : `Welcome to Taskio, ${result.user?.name || 'User'}!`,
          {
            duration: 3000,
            icon: '🎉',
          }
        );

        // Call onSuccess callback
        onSuccess?.(result);

        // Navigate to getting started page immediately
        console.log('🔄 Navigating to getting started page...');
        navigate('/getting-started', { replace: true });

      } else {
        console.error('❌ Google authentication failed:', result?.error);
        
        const errorMessage = result?.error || `Google ${mode} failed`;
        toast.error(errorMessage, {
          duration: 5000,
          icon: '❌',
        });

        onError?.(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      
      const errorMessage = error.message || `Google ${mode} failed`;
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
      });

      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      disabled={isLoading || disabled}
      isLoading={isLoading}
      className={`w-full relative bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all duration-200 ${className}`}
    >
      {isLoading ? (
        mode === 'login' ? 'Signing in...' : 'Signing up...'
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
        </>
      )}
    </Button>
  );
};

export default GoogleAuthButton;
