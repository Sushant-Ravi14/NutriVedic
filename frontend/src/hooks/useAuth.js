import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { loginApi, registerApi, verifyEmailApi, logoutApi } from '../api/auth.api';
import { getProfileApi, saveProfileApi } from '../api/user.api';
import { useUIStore } from '../store/uiStore';

export const useAuth = () => {
  const { user, profile, isAuthenticated, setAuth, clearAuth, updateProfile, isPremium } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  const queryClient = useQueryClient();

  const loginMutation = useMutation(loginApi, {
    onSuccess: async (data) => {
      // Backend returns { success, accessToken, user }
      setAuth(data.user, null, data.accessToken);

      // Fetch profile separately after login
      try {
        const profileData = await getProfileApi();
        const userProfile = profileData?.profile || profileData;
        if (userProfile && (userProfile.age || userProfile.heightCm || userProfile.weightKg || userProfile.targetKcal)) {
          updateProfile(userProfile);
        }
      } catch (e) {
        // Profile may not exist yet for new users — that's OK
      }

      addToast(`Welcome back, ${data.user.firstName || 'User'}!`, 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Login failed';
      addToast(msg, 'error');
    }
  });

  const registerMutation = useMutation(registerApi, {
    onSuccess: (data) => {
      // Backend returns { success, message, userId } — OTP step needed
      addToast(data.message || 'OTP sent to your email!', 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Registration failed';
      addToast(msg, 'error');
    }
  });

  const verifyEmailMutation = useMutation(verifyEmailApi, {
    onSuccess: async (data) => {
      // Backend returns { success, accessToken, user }
      setAuth(data.user, null, data.accessToken);

      try {
        const profileData = await getProfileApi();
        const userProfile = profileData?.profile || profileData;
        if (userProfile && (userProfile.age || userProfile.heightCm || userProfile.weightKg || userProfile.targetKcal)) {
          updateProfile(userProfile);
        }
      } catch (e) {
        // Profile may not exist yet
      }

      addToast('Email verified successfully!', 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'OTP verification failed';
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
    register: registerMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    saveProfile: saveProfileMutation.mutateAsync,
    isLoading: loginMutation.isLoading || registerMutation.isLoading || verifyEmailMutation.isLoading
  };
};
