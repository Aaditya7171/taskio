import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Camera,
  Save,
  Trash2,
  Settings,
  Shield,
  LogOut,
  CheckCircle,
  XCircle,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import api from '@/utils/api';
import { emailApi, userApi } from '@/services/api';
import { toast } from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  email: string;
  age: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailStatus, setEmailStatus] = useState({
    email_verified: false,
    task_reminders_enabled: false
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [isUpdatingReminders, setIsUpdatingReminders] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age?.toString() || '',
    },
  });

  // Fetch email verification status
  useEffect(() => {
    const fetchEmailStatus = async () => {
      try {
        const response = await emailApi.getStatus();
        if (response.data.success && response.data.data) {
          setEmailStatus(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch email status:', error);
      }
    };

    if (user) {
      fetchEmailStatus();
      setIs2FAEnabled(user.two_factor_enabled || false);
    }
  }, [user]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updateData = {
        name: data.name,
        age: data.age ? parseInt(data.age) : undefined,
      };

      const response = await api.put('/users/profile', updateData);

      if (response.data.success) {
        // Update user context with new data
        updateUser(response.data.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');

        // Reset form with new values
        reset({
          name: response.data.data.name || '',
          email: response.data.data.email || '',
          age: response.data.data.age?.toString() || '',
        });
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Here you would call your API to delete the account
        console.log('Account deletion requested');
        await logout();
      } catch (error) {
        console.error('Account deletion error:', error);
      }
    }
  };

  const handleVerifyEmail = () => {
    navigate('/verify-email');
  };

  const handleToggleTaskReminders = async (enabled: boolean) => {
    if (enabled && !emailStatus.email_verified) {
      // Redirect to email verification if trying to enable reminders without verified email
      navigate('/verify-email?redirect=/profile');
      return;
    }

    setIsUpdatingReminders(true);
    try {
      await emailApi.updateTaskReminders(enabled);
      setEmailStatus(prev => ({ ...prev, task_reminders_enabled: enabled }));
      toast.success(`Task reminders ${enabled ? 'enabled' : 'disabled'} successfully!`);
    } catch (error: any) {
      console.error('Update task reminders error:', error);
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email first to enable task reminders');
        navigate('/verify-email?redirect=/profile');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update task reminders');
      }
    } finally {
      setIsUpdatingReminders(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Upload to API
      const response = await api.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update user context with new profile picture URL
        updateUser({ profile_picture_url: response.data.data.profile_picture_url });
        toast.success('Profile picture updated successfully!');
      }

    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!emailStatus.email_verified) {
      toast.error('Please verify your email address before enabling 2FA');
      return;
    }

    setIsToggling2FA(true);
    try {
      const response = await userApi.toggle2FA({ enabled: !is2FAEnabled });
      if (response.data.success && response.data.data) {
        setIs2FAEnabled(response.data.data.two_factor_enabled);
        updateUser({ two_factor_enabled: response.data.data.two_factor_enabled });
        toast.success(`Two-factor authentication ${response.data.data.two_factor_enabled ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update 2FA setting');
    } finally {
      setIsToggling2FA(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Profile Information
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    {user?.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-gradient-to-br from-pink-500 to-purple-600"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-dark-800 rounded-full shadow-lg border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200 hover:scale-110"
                        >
                          <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                        />
                      </>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {user?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                    <Badge variant="success" size="sm" className="mt-2">
                      Active
                    </Badge>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      {...register('name', { required: 'Name is required' })}
                      error={errors.name?.message}
                      disabled={!isEditing}
                      icon={User}
                    />

                    <div className="space-y-2">
                      <Input
                        label="Email Address"
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        error={errors.email?.message}
                        disabled={true} // Email cannot be edited
                        icon={Mail}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {emailStatus.email_verified ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400">
                                Verified
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-600 dark:text-red-400">
                                Not Verified
                              </span>
                            </>
                          )}
                        </div>
                        {!emailStatus.email_verified && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleVerifyEmail}
                            className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            Verify Email
                          </Button>
                        )}
                      </div>
                    </div>

                    <Input
                      label="Age"
                      type="number"
                      {...register('age', {
                        min: { value: 1, message: 'Age must be positive' },
                        max: { value: 150, message: 'Age must be realistic' }
                      })}
                      error={errors.age?.message}
                      disabled={!isEditing}
                      icon={Calendar}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Member Since
                      </label>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg text-gray-900 dark:text-gray-100">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isDirty}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </Card>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Preferences
                </h2>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Appearance
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Theme
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Choose between dark and minimal themes
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                      >
                        {theme === 'dark' ? 'Switch to Minimal' : 'Switch to Dark'}
                      </Button>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {/* Task Reminders Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Task reminders / alerts
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Get email notifications about upcoming due dates
                          </p>
                          {!emailStatus.email_verified && (
                            <div className="flex items-center space-x-2 mt-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <p className="text-sm text-amber-600 dark:text-amber-400">
                                Email verification required to enable alerts
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {!emailStatus.email_verified && emailStatus.task_reminders_enabled && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleVerifyEmail}
                              className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                              Verify Email
                            </Button>
                          )}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={emailStatus.task_reminders_enabled}
                              onChange={(e) => handleToggleTaskReminders(e.target.checked)}
                              disabled={isUpdatingReminders}
                            />
                            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 ${isUpdatingReminders ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  {/* Account Security */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Account Security
                    </h3>
                    <div className="space-y-4">
                      {/* Password Section */}
                      <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Password
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Keep your account secure with a strong password
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowChangePassword(!showChangePassword)}
                          >
                            Change Password
                          </Button>
                        </div>

                        {/* Change Password Form */}
                        {showChangePassword && (
                          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <Input
                              label="Current Password"
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter your current password"
                            />
                            <Input
                              label="New Password"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter your new password"
                            />
                            <Input
                              label="Confirm New Password"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm your new password"
                            />
                            <div className="flex space-x-3">
                              <Button
                                onClick={handleChangePassword}
                                isLoading={isChangingPassword}
                                size="sm"
                              >
                                Update Password
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setShowChangePassword(false);
                                  setPasswordForm({
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: ''
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2FA Section */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Two-Factor Authentication
                            </p>
                            {is2FAEnabled ? (
                              <Badge variant="success" size="sm">Enabled</Badge>
                            ) : (
                              <Badge variant="secondary" size="sm">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {is2FAEnabled
                              ? 'Your account is protected with 2FA'
                              : 'Add an extra layer of security to your account'
                            }
                          </p>
                          {!emailStatus.email_verified && (
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                              ⚠️ Email verification required to enable 2FA
                            </p>
                          )}
                        </div>
                        <Button
                          variant={is2FAEnabled ? "danger" : "outline"}
                          size="sm"
                          onClick={handleToggle2FA}
                          isLoading={isToggling2FA}
                          disabled={!emailStatus.email_verified}
                        >
                          {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Data & Privacy */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Data & Privacy
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Export Data
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Download a copy of your data
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Session Management */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Session Management
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Sign Out
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Sign out of your account on this device
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={logout}
                          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3">
                      Danger Zone
                    </h3>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-200">
                            Delete Account
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
