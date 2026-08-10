import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { loginApi, registerApi, logoutApi, googleAuthApi } from '../api/auth.api';
import { getProfileApi, saveProfileApi } from '../api/user.api';
import { useUIStore } from '../store/uiStore';

export const useAuth = () => {
  const { user, profile, isAuthenticated, setAuth, clearAuth, updateProfile, isPremium } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  const queryClient = useQueryClient();

  const loginMutation = useMutation(loginApi, {
    onSuccess: async (data) => {
      useAuthStore.getState().setAccessToken(data.accessToken);
      let finalProfile = null;
      try {
        const profileData = await getProfileApi();
        const userProfile = profileData?.profile || profileData;
        if (userProfile && (userProfile.age || userProfile.heightCm || userProfile.weightKg || userProfile.targetKcal)) {
          finalProfile = userProfile;
        }
      } catch (e) {}

      setAuth(data.user, finalProfile, data.accessToken);

      addToast(`Welcome back, ${data.user.firstName || 'User'}!`, 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Login failed';
      addToast(msg, 'error');
    }
  });

  const registerMutation = useMutation(registerApi, {
    onSuccess: async (data) => {
      useAuthStore.getState().setAccessToken(data.accessToken);
      let finalProfile = null;
      try {
        const profileData = await getProfileApi();
        const userProfile = profileData?.profile || profileData;
        if (userProfile && (userProfile.age || userProfile.heightCm || userProfile.weightKg || userProfile.targetKcal)) {
          finalProfile = userProfile;
        }
      } catch (e) {}

      setAuth(data.user, finalProfile, data.accessToken);
      addToast(`Account created, welcome ${data.user.firstName || 'User'}!`, 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Registration failed';
      addToast(msg, 'error');
    }
  });

  const googleLoginMutation = useMutation(googleAuthApi, {
    onSuccess: async (data) => {
      useAuthStore.getState().setAccessToken(data.accessToken);
      let finalProfile = null;
      try {
        const profileData = await getProfileApi();
        const userProfile = profileData?.profile || profileData;
        if (userProfile && (userProfile.age || userProfile.heightCm || userProfile.weightKg || userProfile.targetKcal)) {
          finalProfile = userProfile;
        }
      } catch (e) {}

      setAuth(data.user, finalProfile, data.accessToken);
      addToast(`Logged in with Google, welcome ${data.user.firstName || 'User'}!`, 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Google Login failed';
      addToast(msg, 'error');
    }
  });

  const logoutMutation = useMutation(logoutApi, {
    onSettled: () => {
      clearAuth();
      addToast('Logged out successfully', 'info');
    }
  });

  const saveProfileMutation = useMutation(saveProfileApi, {
    onSuccess: (data) => {
      const profileData = data.profile || data;
      updateProfile(profileData);
      
      queryClient.invalidateQueries(['reportsAnalytics']);
      queryClient.invalidateQueries(['dailySummary']);
      queryClient.invalidateQueries(['foodLog']);
      queryClient.invalidateQueries(['dietPlan']);
      
      addToast('Profile saved successfully', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Failed to save profile', 'error');
    }
  });

  return {
    user,
    profile,
    isAuthenticated,
    isPremium: isPremium(),
    login: loginMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    saveProfile: saveProfileMutation.mutateAsync,
    isLoading: loginMutation.isLoading || registerMutation.isLoading || googleLoginMutation.isLoading
  };
};
