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

export const googleAuthApi = async (token) => {
  const res = await client.post('/api/auth/google', { token });
  return res.data;
};
