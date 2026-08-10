import client from './client';

export const loginApi = async (credentials) => {
  const res = await client.post('/api/auth/login', credentials);
  return res.data;
};

export const registerApi = async (userData) => {
  const res = await client.post('/api/auth/register', userData);
  return res.data;
};


export const logoutApi = async () => {
  const res = await client.post('/api/auth/logout');
  return res.data;
};

export const googleAuthUrl = () => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseURL}/api/auth/google`;
};
