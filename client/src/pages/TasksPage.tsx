import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Grid, List } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { TaskFilters } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import TaskList from '@/components/tasks/TaskList';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskModal from '@/components/tasks/TaskModal';
import TaskFiltersPanel from '@/components/tasks/TaskFiltersPanel';

const TasksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Handle URL search parameters
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const { data: tasks = [], isLoading, error } = useTasks({
    ...filters,
    search: searchQuery || undefined,
  });

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  const handleCreateTask = () => {
    setSelectedTaskId(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setSelectedTaskId(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load tasks. Please try again.
          </p>
        </Card>
      </div>
    );
  }

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
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and stay productive
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-md transition-all duration-200 ${
                view === 'kanban'
                  ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                view === 'list'
                  ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <Button onClick={handleCreateTask}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TaskFiltersPanel
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Tasks Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard 
            tasks={tasks} 
            onEditTask={handleEditTask}
          />
        ) : (
          <TaskList 
            tasks={tasks} 
            onEditTask={handleEditTask}
          />
        )}
      </motion.div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          taskId={selectedTaskId}
          isOpen={showTaskModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TasksPage;
