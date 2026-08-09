import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentDietPlanApi, generatePlanApi, swapMealApi, toggleMealEatenApi } from '../api/dietplan.api';
import { useUIStore } from '../store/uiStore';

export const useCurrentPlan = () => {
  return useQuery(['dietPlan', 'current'], getCurrentDietPlanApi, {
    staleTime: 1000 * 60 * 15
  });
};

export const useGeneratePlan = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation(generatePlanApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(['dietPlan']);
      addToast('New diet plan generated!', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Failed to generate plan', 'error');
    }
  });
};

export const useSwapMeal = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation(swapMealApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(['dietPlan', 'current']);
      addToast('Meal swapped successfully', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Failed to swap meal', 'error');
    }
  });
};

export const useToggleEaten = () => {
  const queryClient = useQueryClient();

  return useMutation(toggleMealEatenApi, {
    onMutate: async ({ day, mealId, eaten }) => {
      await queryClient.cancelQueries(['dietPlan', 'current']);
      const previousPlan = queryClient.getQueryData(['dietPlan', 'current']);

      if (previousPlan) {
        queryClient.setQueryData(['dietPlan', 'current'], {
          ...previousPlan,
          days: previousPlan.days.map((d) => {
            if (d.day !== day) return d;
            return {
              ...d,
              meals: d.meals.map((m) => (m.id === mealId ? { ...m, eaten } : m))
            };
          })
        });
      }
      return { previousPlan };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(['dietPlan', 'current'], context.previousPlan);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['dietPlan', 'current']);
    }
  });
};
