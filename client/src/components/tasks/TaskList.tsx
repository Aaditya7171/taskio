import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No tasks found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first task to get started with your productivity journey.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <TaskCard
            task={task}
            onEdit={() => onEditTask(task.id)}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default TaskList;
