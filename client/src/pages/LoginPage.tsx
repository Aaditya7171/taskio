import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Zap, CheckCircle, Target, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Card from '@/components/ui/Card';
import SecureForm from '@/components/security/SecureForm';
// import SecureInput from '@/components/security/SecureInput';
import SecurePasswordInput from '@/components/security/SecurePasswordInput';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { toast } from 'react-hot-toast';
import { validateEmail, validatePassword } from '@/utils/security';

const features = [
  {
    icon: CheckCircle,
    title: 'Smart Task Management',
    description: 'Organize tasks with priorities, due dates, and rich attachments'
  },
  {
    icon: Target,
    title: 'Habit Tracking',
    description: 'Build lasting habits with streak tracking and daily completions'
  },
  {
    icon: BarChart3,
    title: 'Productivity Insights',
    description: 'Analyze your productivity patterns with detailed analytics'
  }
];

interface LoginFormData {
  email: string;
  password: string;
  otp?: string;
  newPassword?: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
}

const LoginPage: React.FC = () => {
  const { loginWithJWT, register, verify2FA, forgotPassword, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [tempUserId, setTempUserId] = useState<string>('');
  const [tempEmail, setTempEmail] = useState<string>('');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<LoginFormData & RegisterFormData>();

  const onSubmit = async (data: LoginFormData & RegisterFormData & { otp?: string; newPassword?: string }) => {
    setIsLoading(true);
    try {
      // Additional security validation
      if (data.email && !validateEmail(data.email)) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      if (data.password && !isLogin && !validatePassword(data.password)) {
        toast.error('Password must be at least 8 characters with uppercase, lowercase, and number');
        setIsLoading(false);
        return;
      }
      if (show2FA) {
        // Handle 2FA verification
        if (!data.otp) {
          toast.error('Please enter the 2FA code');
          return;
        }
        await verify2FA(tempUserId, data.otp);
        toast.success('Welcome back!');
        setShow2FA(false);
      } else if (showForgotPassword) {
        // Handle forgot password
        await forgotPassword(data.email);
        toast.success('Password reset code sent to your email');
        setTempEmail(data.email);
        setShowForgotPassword(false);
        setShowPasswordReset(true);
      } else if (showPasswordReset) {
        // Handle password reset
        if (!data.otp || !data.newPassword) {
          toast.error('Please enter the reset code and new password');
          return;
        }
        await resetPassword(tempEmail, data.otp, data.newPassword);
        toast.success('Password reset successfully! Please log in.');
        setShowPasswordReset(false);
        setTempEmail('');
        reset();
      } else if (isLogin) {
        // Handle login
        const result = await loginWithJWT(data.email, data.password);
        if (result.requires2FA && result.userId) {
          setTempUserId(result.userId);
          setShow2FA(true);
          toast.success('2FA code sent to your email');
        } else {
          toast.success('Welcome back!');
        }
      } else {
        // Handle registration
        if (data.password !== data.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        await register(data.name, data.email, data.password);
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    setShow2FA(false);
    setShowPasswordReset(false);
    setTempUserId('');
    setTempEmail('');
    reset();
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setIsLogin(false);
    reset();
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShow2FA(false);
    setShowPasswordReset(false);
    setIsLogin(true);
    setTempUserId('');
    setTempEmail('');
    reset();
  };

  const getFormTitle = () => {
    if (show2FA) return 'Two-Factor Authentication';
    if (showForgotPassword) return 'Forgot Password';
    if (showPasswordReset) return 'Reset Password';
    return isLogin ? 'Welcome Back' : 'Create Account';
  };

  const getFormDescription = () => {
    if (show2FA) return 'Enter the 6-digit code sent to your email';
    if (showForgotPassword) return 'Enter your email to receive a password reset code';
    if (showPasswordReset) return 'Enter the code from your email and your new password';
    return isLogin
      ? 'Sign in to continue to your productivity dashboard'
      : 'Join Taskio and start your productivity journey';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-white/5 dark:bg-dark-900/5 backdrop-blur-sm border-r border-white/10 dark:border-dark-700/10">
        <div className="flex flex-col justify-center px-12 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Taskio</h1>
            </div>

            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Supercharge Your
              <span className="block gradient-text">Productivity</span>
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
              The modern todo app that adapts to your workflow. Track tasks, build habits, 
              and gain insights into your productivity patterns.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-white/10 dark:bg-dark-800/10 backdrop-blur-md border-white/20 dark:border-dark-700/20">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Taskio</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {getFormTitle()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getFormDescription()}
              </p>
            </div>

            <SecureForm onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 2FA Code Input */}
              {show2FA && (
                <Input
                  label="2FA Code"
                  {...registerField('otp', {
                    required: '2FA code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Code must be 6 digits'
                    }
                  })}
                  error={errors.otp?.message}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              )}

              {/* Forgot Password - Email Input */}
              {showForgotPassword && (
                <Input
                  label="Email Address"
                  type="email"
                  {...registerField('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={errors.email?.message}
                  placeholder="Enter your email"
                />
              )}

              {/* Password Reset - OTP and New Password */}
              {showPasswordReset && (
                <>
                  <Input
                    label="Reset Code"
                    {...registerField('otp', {
                      required: 'Reset code is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Code must be 6 digits'
                      }
                    })}
                    error={errors.otp?.message}
                    placeholder="Enter 6-digit code from email"
                    maxLength={6}
                  />
                  <SecurePasswordInput
                    label="New Password"
                    {...registerField('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                    error={errors.newPassword?.message}
                    placeholder="Enter your new password"
                    requireValidation={true}
                    helperText="Must contain uppercase, lowercase, and number"
                  />
                </>
              )}

              {/* Regular Login/Register Fields */}
              {!show2FA && !showForgotPassword && !showPasswordReset && (
                <>
                  {!isLogin && (
                    <Input
                      label="Full Name"
                      {...registerField('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      error={errors.name?.message}
                      placeholder="Enter your full name"
                    />
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    {...registerField('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    error={errors.email?.message}
                    placeholder="Enter your email"
                  />

                  <div className="space-y-2">
                    {isLogin ? (
                      <PasswordInput
                        label="Password"
                        {...registerField('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        error={errors.password?.message}
                        placeholder="Enter your password"
                      />
                    ) : (
                      <SecurePasswordInput
                        label="Password"
                        {...registerField('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })}
                        error={errors.password?.message}
                        placeholder="Enter your password"
                        requireValidation={true}
                        helperText="Must contain uppercase, lowercase, and number"
                      />
                    )}
                    {isLogin && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <SecurePasswordInput
                      label="Confirm Password"
                      {...registerField('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === watch('password') || 'Passwords do not match'
                      })}
                      error={errors.confirmPassword?.message}
                      placeholder="Confirm your password"
                    />
                  )}
                </>
              )}

              <Button
                type="submit"
                className="w-full py-3 text-lg"
                size="lg"
                isLoading={isLoading}
              >
                {show2FA && 'Verify 2FA Code'}
                {showForgotPassword && 'Send Reset Code'}
                {showPasswordReset && 'Reset Password'}
                {!show2FA && !showForgotPassword && !showPasswordReset && (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              {/* Google Auth Button - Only show for login/register, not for 2FA or password reset */}
              {!show2FA && !showForgotPassword && !showPasswordReset && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-dark-800 px-2 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <GoogleAuthButton
                    mode={isLogin ? 'login' : 'signup'}
                    onSuccess={(result) => {
                      toast.success(
                        isLogin
                          ? `Welcome back, ${result.user?.name || 'User'}!`
                          : `Welcome to Taskio, ${result.user?.name || 'User'}!`
                      );
                      // Navigation will be handled by the auth context
                    }}
                    onError={(error) => {
                      toast.error(error);
                    }}
                    disabled={isLoading}
                  />
                </>
              )}

              {/* Navigation Links */}
              <div className="text-center space-y-2">
                {(show2FA || showForgotPassword || showPasswordReset) && (
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
                  >
                    ← Back to Login
                  </button>
                )}

                {!show2FA && !showForgotPassword && !showPasswordReset && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      {isLogin ? 'Create one' : 'Sign in'}
                    </button>
                  </p>
                )}
              </div>
            </SecureForm>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Secure</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Fast</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Reliable</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
