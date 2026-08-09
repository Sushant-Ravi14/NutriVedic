import { create } from 'zustand';

// Load stored user & profile from localStorage if present
const storedUser = localStorage.getItem('nutrivedic_user');
const storedProfile = localStorage.getItem('nutrivedic_profile');
const storedToken = localStorage.getItem('nutrivedic_token');

export const useAuthStore = create((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  profile: storedProfile ? JSON.parse(storedProfile) : null,
  accessToken: storedToken || null,
  isAuthenticated: Boolean(storedToken && storedUser),

  setAuth: (user, profile, token) => {
    if (user) localStorage.setItem('nutrivedic_user', JSON.stringify(user));
    if (profile) localStorage.setItem('nutrivedic_profile', JSON.stringify(profile));
    if (token) localStorage.setItem('nutrivedic_token', token);
    set({
      user,
      profile,
      accessToken: token,
      isAuthenticated: Boolean(user && token)
    });
  },

  setAccessToken: (token) => {
    localStorage.setItem('nutrivedic_token', token);
    set({ accessToken: token });
  },

  updateProfile: (profile) => {
    localStorage.setItem('nutrivedic_profile', JSON.stringify(profile));
    set((state) => ({ ...state, profile }));
  },

  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    localStorage.setItem('nutrivedic_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  clearAuth: () => {
    localStorage.removeItem('nutrivedic_user');
    localStorage.removeItem('nutrivedic_profile');
    localStorage.removeItem('nutrivedic_token');
    set({
      user: null,
      profile: null,
      accessToken: null,
      isAuthenticated: false
    });
  },

  isPremium: () => {
    const user = get().user;
    return user?.subscriptionTier === 'premium';
  }
}));
