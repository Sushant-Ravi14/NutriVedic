import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { loginApi, registerApi, verifyEmailApi, logoutApi } from '../api/auth.api';
import { getProfileApi, saveProfileApi } from '../api/user.api';
import { useUIStore } from '../store/uiStore';

export const useAuth = () => {
  const { user, profile, isAuthenticated, setAuth, clearAuth, updateProfile, isPremium } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  const loginMutation = useMutation(loginApi, {
    onSuccess: async (data) => {
      // Backend returns { success, accessToken, user }
      setAuth(data.user, null, data.accessToken);

      // Fetch profile separately after login
      try {
        const profileData = await getProfileApi();
        if (profileData && profileData.age) {
          updateProfile(profileData);
        }
      } catch (e) {
        // Profile may not exist yet for new users — that's OK
      }

      addToast(`Welcome back, ${data.user.firstName || 'User'}!`, 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.error || err.message || 'Login failed', 'error');
    }
  });

  const registerMutation = useMutation(registerApi, {
    onSuccess: (data) => {
      // Backend returns { success, message, userId } — OTP step needed
      addToast(data.message || 'OTP sent to your email!', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Registration failed', 'error');
    }
  });

  const verifyEmailMutation = useMutation(verifyEmailApi, {
    onSuccess: (data) => {
      // Backend returns { success, accessToken, user }
      setAuth(data.user, null, data.accessToken);
      addToast('Email verified successfully!', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'OTP verification failed', 'error');
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
