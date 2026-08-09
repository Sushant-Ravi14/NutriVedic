/**
 * Sync Queue Helper
 */
import { useOfflineStore } from '../store/offlineStore';

export const processSyncQueue = async () => {
  const offlineStore = useOfflineStore.getState();
  if (offlineStore.isOnline && offlineStore.queue.length > 0) {
    await offlineStore.syncWhenOnline();
  }
};
