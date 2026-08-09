import { useQuery } from '@tanstack/react-query';
import { getInventoryItemsApi } from '../api/freshness.api';

export const useInventory = () => {
  return useQuery(['inventoryItems'], getInventoryItemsApi, {
    staleTime: 1000 * 60 * 5
  });
};
