import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { habitsApi } from '@/services/api';
import { Habit } from '@/types';

export const useHabits = () => {
  return useQuery(
    ['habits'],
    () => habitsApi.getHabits().then(res => res.data.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useHabit = (id: string) => {
  return useQuery(
    ['habit', id],
    () => habitsApi.getHabit(id).then(res => res.data.data),
    {
      enabled: !!id,
    }
  );
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Partial<Habit>) => habitsApi.createHabit(data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['habits']);
        toast.success(response.data.message || 'Habit created successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to create habit');
      },
    }
  );
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: Partial<Habit> }) => 
      habitsApi.updateHabit(id, data),
    {
      onSuccess: (response, { id }) => {
        queryClient.invalidateQueries(['habits']);
        queryClient.invalidateQueries(['habit', id]);
        toast.success(response.data.message || 'Habit updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update habit');
      },
    }
  );
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => habitsApi.deleteHabit(id),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['habits']);
        toast.success(response.data.message || 'Habit deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete habit');
      },
    }
  );
};

export const useCompleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => habitsApi.completeHabit(id),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['habits']);
        toast.success(response.data.message || 'Habit completed!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to complete habit');
      },
    }
  );
};
