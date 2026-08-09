import { useEffect } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { useUIStore } from '../store/uiStore';

export const useOffline = () => {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const setOnline = useOfflineStore((state) => state.setOnline);
  const syncWhenOnline = useOfflineStore((state) => state.syncWhenOnline);
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      addToast('Back online! Syncing data...', 'info');
      syncWhenOnline();
    };

    const handleOffline = () => {
      setOnline(false);
      addToast("You're offline. Changes will sync when connected.", 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, syncWhenOnline, addToast]);

  return { isOnline };
};
