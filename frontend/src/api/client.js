import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network / Offline error
    if (!error.response && error.message === 'Network Error') {
      const offlineStore = useOfflineStore.getState();
      if (originalRequest && originalRequest.method !== 'get') {
        offlineStore.addToQueue({
          type: originalRequest.method,
          endpoint: originalRequest.url,
          data: originalRequest.data ? JSON.parse(originalRequest.data) : null
        });
      }
      return Promise.reject(new Error('Network error: Action queued offline.'));
    }

    const { status, data } = error.response || {};

    // 401 Unauthorized -> Refresh token attempt
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshErr) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/auth';
        return Promise.reject(refreshErr);
      }
    }

    // 403 Premium required redirect
    if (status === 403 && data?.error === 'premium_required') {
      window.location.href = '/settings?tab=subscription';
    }

    return Promise.reject(error);
  }
);

export default client;
