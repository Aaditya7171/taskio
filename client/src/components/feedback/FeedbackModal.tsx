import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRating } from '@/contexts/RatingContext';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import SecureForm from '@/components/security/SecureForm';
// import SecureInput from '@/components/security/SecureInput';
import { toast } from 'react-hot-toast';
import { sendFeedbackEmail } from '@/services/emailjs';
import { sanitizeText } from '@/utils/security';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { addRating } = useRating();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!user) {
      toast.error('User information not available');
      return;
    }

    setIsSubmitting(true);

    try {
      await sendFeedbackEmail(rating, user.name, user.email, message);

      // Add rating to context for average calculation
      addRating(rating);

      // Reset form
      setRating(0);
      setMessage('');
      onClose();
      onSuccess();

    } catch (error) {
      console.error('Failed to send feedback:', error);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      className="overflow-visible"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative"
      >
        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-30 animate-pulse delay-300"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500',
              'shadow-lg'
            )}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Share Your Feedback
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help us improve Taskio for everyone
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <SecureForm onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How would you rate your experience?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your rating helps us understand what we're doing well
              </p>
            </div>

            <motion.div
              className="flex justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
            </motion.div>

            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-purple-600 dark:text-purple-400"
              >
                {rating === 1 && "We're sorry to hear that. Please tell us how we can improve."}
                {rating === 2 && "Thanks for the feedback. We'd love to know how to do better."}
                {rating === 3 && "Thank you! We appreciate your honest feedback."}
                {rating === 4 && "Great! We're glad you're enjoying Taskio."}
                {rating === 5 && "Awesome! We're thrilled you love using Taskio!"}
              </motion.p>
            )}
          </div>

          {/* Message Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(sanitizeText(e.target.value))}
              placeholder="Tell us more about your experience, suggestions, or any issues you've encountered..."
              rows={4}
              className={cn(
                'w-full px-4 py-3 rounded-lg border transition-all duration-200',
                'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                'border-gray-300 dark:border-gray-600',
                'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                'placeholder-gray-500 dark:placeholder-gray-400',
                'resize-none'
              )}
              disabled={isSubmitting}
              maxLength={1000} // Limit message length
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 hover:from-pink-600 hover:via-purple-700 hover:to-blue-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </div>
        </SecureForm>
      </motion.div>
    </Modal>
  );
};

// Helper function for className concatenation
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default FeedbackModal;
