import { useQuery } from '@tanstack/react-query';
import { getReportsAnalyticsApi } from '../api/analytics.api';

export const useReports = () => {
  return useQuery(['reportsAnalytics'], getReportsAnalyticsApi, {
    staleTime: 1000 * 60 * 10
  });
};
