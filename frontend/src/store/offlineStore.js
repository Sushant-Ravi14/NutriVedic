import { create } from 'zustand';
import axios from 'axios';

const STORED_QUEUE_KEY = 'nutrivedic_offline_queue';
const initialQueue = JSON.parse(localStorage.getItem(STORED_QUEUE_KEY) || '[]');

export const useOfflineStore = create((set, get) => ({
  queue: initialQueue,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

  addToQueue: (operation) => {
    const item = {
      id: Date.now().toString(),
      type: operation.type,
      endpoint: operation.endpoint,
      data: operation.data,
      timestamp: new Date().toISOString()
    };
    const newQueue = [...get().queue, item];
    localStorage.setItem(STORED_QUEUE_KEY, JSON.stringify(newQueue));
    set({ queue: newQueue });
  },

  clearQueue: () => {
    localStorage.removeItem(STORED_QUEUE_KEY);
    set({ queue: [] });
  },

  setOnline: (status) => set({ isOnline: status }),

  syncWhenOnline: async () => {
    const { queue, clearQueue, isOnline } = get();
    if (!isOnline || queue.length === 0) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/sync`, { operations: queue }, { withCredentials: true });
      clearQueue();
    } catch (err) {
      console.warn('Offline sync failed, will retry on next reconnection:', err);
    }
  }
}));
