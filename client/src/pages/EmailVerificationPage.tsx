import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// import { useTheme } from '@/contexts/ThemeContext'; // Commented out as not used
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { emailApi } from '@/services/api';
import { toast } from 'react-hot-toast';

const EmailVerificationPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  // const { theme } = useTheme(); // Commented out as not used
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/profile';

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hasInitialSend, setHasInitialSend] = useState(false);

  useEffect(() => {
    // Check if user is already verified
    if (user?.email_verified) {
      setIsVerified(true);
      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);
    }
  }, [user, navigate, redirectTo]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return;
    }

    setIsSending(true);
    try {
      await emailApi.sendVerification();
      toast.success('Verification code sent to your email!');
      setCountdown(60); // 60 second cooldown
      setHasInitialSend(true); // Mark that we've sent at least one code
    } catch (error: any) {
      console.error('Send verification error:', error);
      toast.error(error.response?.data?.error || 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      await emailApi.verifyEmail(otp);
      
      // Update user context
      if (user) {
        updateUser({ ...user, email_verified: true });
      }
      
      setIsVerified(true);
      toast.success('Email verified successfully!');
      
      // Redirect after success
      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);
    } catch (error: any) {
      console.error('Verify email error:', error);
      toast.error(error.response?.data?.error || 'Failed to verify email');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    if (countdown === 0) {
      handleSendVerification();
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your email has been successfully verified.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting you back...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verify Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {hasInitialSend ? "We've sent a verification code to" : "Ready to verify your email address"}
              </p>
              <p className="text-purple-600 dark:text-purple-400 font-medium">
                {user?.email}
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <div>
                <Input
                  label="Verification Code"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  disabled={isVerifying}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || otp.length !== 6}
                isLoading={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            {/* Send/Resend Section */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {hasInitialSend ? "Didn't receive the code?" : "Click below to send verification code"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={countdown > 0 || isSending}
                className="text-purple-600 dark:text-purple-400"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : hasInitialSend ? (
                  'Resend Code'
                ) : (
                  'Send Code'
                )}
              </Button>
            </div>

            {/* Back Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="w-full text-gray-600 dark:text-gray-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Having trouble?</p>
                  <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-400">
                    <li>• Check your spam/junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• The code expires in 10 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
