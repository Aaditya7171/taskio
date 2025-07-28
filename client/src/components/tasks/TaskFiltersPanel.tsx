import React from 'react';
import { X } from 'lucide-react';
import { TaskFilters } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface TaskFiltersPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const TaskFiltersPanel: React.FC<TaskFiltersPanelProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: keyof TaskFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Filters
        </h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {['todo', 'in_progress', 'done'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={filters.status === status}
                  onChange={(e) => handleFilterChange('status', e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                checked={!filters.status}
                onChange={() => clearFilter('status')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                All
              </span>
            </label>
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <div className="space-y-2">
            {['high', 'medium', 'low'].map((priority) => (
              <label key={priority} className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={filters.priority === priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {priority}
                </span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                checked={!filters.priority}
                onChange={() => clearFilter('priority')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                All
              </span>
            </label>
          </div>
        </div>

        {/* Due Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Due Date From
          </label>
          <input
            type="date"
            value={filters.due_date_from || ''}
            onChange={(e) => handleFilterChange('due_date_from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Due Date To
          </label>
          <input
            type="date"
            value={filters.due_date_to || ''}
            onChange={(e) => handleFilterChange('due_date_to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Active Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <Badge variant="primary" className="flex items-center gap-1">
                Status: {filters.status.replace('_', ' ')}
                <button
                  onClick={() => clearFilter('status')}
                  className="ml-1 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.priority && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Priority: {filters.priority}
                <button
                  onClick={() => clearFilter('priority')}
                  className="ml-1 hover:bg-secondary-200 dark:hover:bg-secondary-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.due_date_from && (
              <Badge variant="success" className="flex items-center gap-1">
                From: {filters.due_date_from}
                <button
                  onClick={() => clearFilter('due_date_from')}
                  className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.due_date_to && (
              <Badge variant="warning" className="flex items-center gap-1">
                To: {filters.due_date_to}
                <button
                  onClick={() => clearFilter('due_date_to')}
                  className="ml-1 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TaskFiltersPanel;
