import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Paperclip,
  MessageSquare,
  MoreHorizontal,
  Clock,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { Task } from '@/types';
import { formatDueDate, isOverdue } from '@/utils/date';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, isDragging = false }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'success';
      case 'in_progress': return 'primary';
      case 'todo': return 'gray';
      default: return 'gray';
    }
  };

  const isTaskOverdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    // Prevent edit during drag operations
    if (isDragging) return;

    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-3 md:p-4 cursor-pointer transition-all duration-300 ease-out group select-none transform-gpu ${
          isDragging
            ? 'shadow-2xl bg-white dark:bg-dark-700 ring-2 ring-primary-400 dark:ring-primary-600 ring-opacity-60 backdrop-blur-sm'
            : 'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1'
        } ${
          isTaskOverdue
            ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
            : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
        }`}

      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-start space-x-1.5 md:space-x-2 flex-1">
            {/* Drag handle */}
            <div className="flex-shrink-0 mt-0.5 md:mt-1">
              <Tooltip content="Drag to move between columns" position="left">
                <div className="drag-handle p-0.5 md:p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                  <GripVertical className="w-3 h-3 md:w-4 md:h-4 text-gray-400 dark:text-gray-500 opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                </div>
              </Tooltip>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
          >
            <MoreHorizontal className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>

        {/* Priority and Status */}
        <div className="flex items-center space-x-1.5 md:space-x-2 mb-2 md:mb-3">
          <Badge variant={getPriorityColor(task.priority)} size="sm" className="text-xs px-1.5 py-0.5">
            {task.priority}
          </Badge>
          <Badge variant={getStatusColor(task.status)} size="sm" className="text-xs px-1.5 py-0.5 hidden sm:flex">
            {task.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div className={`flex items-center text-xs md:text-sm mb-2 md:mb-3 ${
            isTaskOverdue
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {isTaskOverdue ? (
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            ) : (
              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            )}
            <span className="truncate">{formatDueDate(task.due_date)}</span>
          </div>
        )}

        {/* Attachments and Notes Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 text-xs md:text-sm">
            {/* Attachment Indicator */}
            {(task.attachment_count && task.attachment_count > 0) && (
              <div className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full transition-all duration-200 hover:scale-105">
                <Paperclip className="w-3 h-3 mr-0.5 md:mr-1" />
                <span className="text-xs font-medium">{task.attachment_count}</span>
              </div>
            )}

            {/* Notes Indicator */}
            {task.has_notes && (
              <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <MessageSquare className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">Notes</span>
              </div>
            )}
          </div>

          {/* Time indicator */}
          <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(task.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Progress indicator for in-progress tasks */}
        {task.status === 'in_progress' && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1">
              <div
                className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                style={{ width: '60%' }} // This could be dynamic based on subtasks
              />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default TaskCard;
