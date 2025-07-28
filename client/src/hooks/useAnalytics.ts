import { useQuery } from 'react-query';
import { analyticsApi } from '@/services/api';

export const useProductivityInsights = (days?: number) => {
  return useQuery(
    ['productivity-insights', days],
    () => analyticsApi.getProductivityInsights(days).then(res => res.data.data),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useTaskTimeline = (startDate?: string, endDate?: string) => {
  return useQuery(
    ['task-timeline', startDate, endDate],
    () => analyticsApi.getTaskTimeline(startDate, endDate).then(res => res.data.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useWorkloadAnalysis = () => {
  return useQuery(
    ['workload-analysis'],
    () => analyticsApi.getWorkloadAnalysis().then(res => res.data.data),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  );
};
