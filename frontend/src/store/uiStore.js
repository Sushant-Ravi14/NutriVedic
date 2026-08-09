import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  activeNav: 'dashboard',
  sidebarOpen: true,
  toasts: [],
  pwaInstallPrompt: null,
  pwaDismissed: localStorage.getItem('nutrivedic_pwa_dismissed') === 'true',
  preferences: JSON.parse(
    localStorage.getItem('nutrivedic_preferences') ||
      '{"notifications":true,"weeklyReportEmail":true,"darkMode":false,"metricUnits":true}'
  ),

  setActiveNav: (nav) => set({ activeNav: nav }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  updatePreference: (key, val) => {
    const current = get().preferences;
    const updated = { ...current, [key]: val };
    localStorage.setItem('nutrivedic_preferences', JSON.stringify(updated));
    set({ preferences: updated });
  },

  addToast: (message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newToast = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  setPwaInstallPrompt: (prompt) => set({ pwaInstallPrompt: prompt }),
  dismissPwaInstall: () => {
    localStorage.setItem('nutrivedic_pwa_dismissed', 'true');
    set({ pwaDismissed: true });
  }
}));
