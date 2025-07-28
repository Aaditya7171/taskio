import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

import { useHabit, useCreateHabit, useUpdateHabit, useDeleteHabit } from '@/hooks/useHabits';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface HabitModalProps {
  habitId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface HabitFormData {
  name: string;
  description: string;
}

const HabitModal: React.FC<HabitModalProps> = ({ habitId, isOpen, onClose }) => {
  const { data: habit, isLoading } = useHabit(habitId || '');
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<HabitFormData>();

  const isEditing = !!habitId;

  useEffect(() => {
    if (habit) {
      reset({
        name: habit.name,
        description: habit.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [habit, reset]);

  const onSubmit = async (data: HabitFormData) => {
    try {
      if (isEditing && habitId) {
        await updateHabitMutation.mutateAsync({ id: habitId, data });
      } else {
        await createHabitMutation.mutateAsync(data);
      }
      
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleDelete = async () => {
    if (habitId && window.confirm('Are you sure you want to delete this habit? This will also delete all completion history.')) {
      try {
        await deleteHabitMutation.mutateAsync(habitId);
        onClose();
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  };

  if (isLoading && isEditing) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading...">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'Create New Habit'}
      size="md"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {isEditing ? 'Update Your Habit' : 'Build a New Habit'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEditing 
                ? 'Make changes to your habit details'
                : 'Start building a positive habit that will improve your life'
              }
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Habit Name"
              {...register('name', { 
                required: 'Habit name is required',
                minLength: { value: 2, message: 'Habit name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Habit name must be less than 100 characters' }
              })}
              error={errors.name?.message}
              placeholder="e.g., Drink 8 glasses of water, Read for 30 minutes..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register('description', {
                  maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Add more details about your habit, why it's important to you, or how you plan to achieve it..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Habit Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              💡 Tips for Success
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Start small - aim for consistency over perfection</li>
              <li>• Be specific about when and where you'll do this habit</li>
              <li>• Track your progress daily to build momentum</li>
              <li>• Celebrate small wins along the way</li>
            </ul>
          </div>

          {/* Current Streak Info */}
          {isEditing && habit && (
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Current Streak
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Keep it going!
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">
                    {habit.streak_count}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    day{habit.streak_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={deleteHabitMutation.isLoading}
                >
                  Delete Habit
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createHabitMutation.isLoading || updateHabitMutation.isLoading}
                disabled={isEditing && !isDirty}
              >
                {isEditing ? 'Update Habit' : 'Create Habit'}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default HabitModal;
