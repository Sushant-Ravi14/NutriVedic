import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logFreshnessScanApi } from '../api/freshness.api';
import { predictFreshness } from '../utils/tfModel';
import { useUIStore } from '../store/uiStore';

export const useFreshness = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const analyzeImageMutation = useMutation(async (imgElement) => {
    return await predictFreshness(imgElement);
  });

  const saveFreshnessMutation = useMutation(logFreshnessScanApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(['inventoryItems']);
      addToast('Item added to inventory tracking', 'success');
    }
  });

  return {
    analyzeImage: analyzeImageMutation.mutateAsync,
    isAnalyzing: analyzeImageMutation.isLoading,
    saveFreshness: saveFreshnessMutation.mutateAsync
  };
};
