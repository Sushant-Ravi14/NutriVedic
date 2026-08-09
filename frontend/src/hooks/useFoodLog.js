import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFoodLogApi, logMealApi, deleteMealItemApi, updateWaterApi } from '../api/nutrition.api';
import { getReportsAnalyticsApi } from '../api/analytics.api';
import { formatISODate } from '../utils/formatters';
import { useUIStore } from '../store/uiStore';

export const useLogsByDate = (date = formatISODate()) => {
  return useQuery(['foodLog', date], () => getFoodLogApi(date), {
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
    retry: 1
  });
};

export const useDailySummary = (date = formatISODate()) => {
  return useQuery(['dailySummary', date], async () => {
    const data = await getFoodLogApi(date);
    return data.summary;
  }, {
    staleTime: 1000 * 60 * 5,
    retry: 1
  });
};

export const useLogMeal = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation(logMealApi, {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['foodLog']);
      queryClient.invalidateQueries(['dailySummary']);
      addToast('Meal added to log successfully', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.error || err.message || 'Failed to log meal', 'error');
    }
  });
};

export const useDeleteMeal = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation(deleteMealItemApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(['foodLog']);
      queryClient.invalidateQueries(['dailySummary']);
      addToast('Item removed from log', 'info');
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Failed to delete item', 'error');
    }
  });
};

export const useUpdateWater = () => {
  const queryClient = useQueryClient();

  return useMutation(updateWaterApi, {
    onMutate: async (newGlasses) => {
      await queryClient.cancelQueries(['foodLog']);
      const today = formatISODate();
      const previousLog = queryClient.getQueryData(['foodLog', today]);

      if (previousLog) {
        queryClient.setQueryData(['foodLog', today], {
          ...previousLog,
          summary: {
            ...previousLog.summary,
            waterGlasses: newGlasses
          }
        });
      }
      return { previousLog, today };
    },
    onError: (err, newGlasses, context) => {
      if (context?.previousLog) {
        queryClient.setQueryData(['foodLog', context.today], context.previousLog);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['foodLog']);
      queryClient.invalidateQueries(['dailySummary']);
    }
  });
};

export const useWeeklyData = () => {
  return useQuery(['weeklyData'], async () => {
    const data = await getReportsAnalyticsApi();
    return data.weeklyBarData;
  }, {
    retry: 1
  });
};

export const useComplianceData = () => {
  return useQuery(['compliance'], async () => {
    const data = await getReportsAnalyticsApi();
    return data.complianceList;
  }, {
    retry: 1
  });
};
