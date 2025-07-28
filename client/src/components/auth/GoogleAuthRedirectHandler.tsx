import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleAuthService } from '@/services/googleAuth';
import { toast } from 'react-hot-toast';
import LoadingScreen from '@/components/ui/LoadingScreen';

const GoogleAuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('🔄 Handling Google Auth redirect result...');
        
        const result = await googleAuthService.handleRedirectResult();
        
        if (result?.success && result?.user) {
          console.log('✅ Google redirect authentication successful');
          
          toast.success(
            `Welcome to Taskio, ${result.user?.name || 'User'}!`,
            {
              duration: 4000,
              icon: '🎉',
            }
          );
          
          // Navigate to getting started page
          navigate('/getting-started', { replace: true });
        } else if (result === null) {
          // No redirect result, probably direct access
          console.log('ℹ️ No Google Auth redirect result found');
          navigate('/login', { replace: true });
        } else {
          // Error in redirect result
          console.error('❌ Google Auth redirect failed:', result?.error);
          toast.error(result?.error || 'Google authentication failed');
          navigate('/login', { replace: true });
        }
      } catch (error: any) {
        console.error('❌ Error handling Google Auth redirect:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    handleRedirectResult();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <LoadingScreen />
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Completing Google Sign-In...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we finish setting up your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthRedirectHandler;
