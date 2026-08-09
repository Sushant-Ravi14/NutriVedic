import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logFreshnessScanApi } from '../api/freshness.api';
import { useUIStore } from '../store/uiStore';

export const useFreshness = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const analyzeImageMutation = useMutation(async (fileOrBlob) => {
    const formData = new FormData();
    // Handle both File and Blob objects
    if (fileOrBlob instanceof File) {
      formData.append('image', fileOrBlob);
    } else {
      formData.append('image', fileOrBlob, 'produce.jpg');
    }
    formData.append('addToInventory', 'true');

    const res = await logFreshnessScanApi(formData);
    const scan = res.scan || {};

    return {
      itemName: scan.foodIdentified || 'Fresh Produce',
      score: scan.freshnessScore ?? 80,
      freshnessClass: scan.status || scan.freshnessClass || 'Fresh',
      shelfLifeDays: scan.estimatedDaysRemaining ?? 3,
      recommendation: scan.shelfLifeTip || scan.storageAdvice || 'Keep in cool storage.',
      nutritionNote: scan.nutritionNote || null,
      healthNote: scan.healthNote || null
    };
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries(['inventoryItems']);
      addToast('Produce analyzed and added to inventory tracking', 'success');
    },
    onError: (error) => {
      const errMsg = error.response?.data?.message || error.message || 'Failed to analyze produce';
      addToast(errMsg, 'error');
    }
  });

  return {
    analyzeImage: analyzeImageMutation.mutateAsync,
    isAnalyzing: analyzeImageMutation.isLoading,
    result: analyzeImageMutation.data
  };
};
