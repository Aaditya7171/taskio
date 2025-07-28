import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { tasksApi } from '@/services/api';
import { Task, TaskFilters } from '@/types';

export const useTasks = (filters?: TaskFilters) => {
  return useQuery(
    ['tasks', filters],
    () => tasksApi.getTasks(filters).then(res => res.data.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useTask = (id: string) => {
  return useQuery(
    ['task', id],
    () => tasksApi.getTask(id).then(res => res.data.data),
    {
      enabled: !!id,
    }
  );
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Partial<Task>) => tasksApi.createTask(data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['tasks']);
        toast.success(response.data.message || 'Task created successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to create task');
      },
    }
  );
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: Partial<Task> }) => 
      tasksApi.updateTask(id, data),
    {
      onSuccess: (response, { id }) => {
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['task', id]);
        toast.success(response.data.message || 'Task updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update task');
      },
    }
  );
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => tasksApi.deleteTask(id),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['tasks']);
        toast.success(response.data.message || 'Task deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete task');
      },
    }
  );
};
