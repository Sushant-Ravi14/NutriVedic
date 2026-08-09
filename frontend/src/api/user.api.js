import client from './client';

export const getProfileApi = async () => {
  const res = await client.get('/api/user/profile');
  return res.data;
};

export const saveProfileApi = async (profileData) => {
  const res = await client.put('/api/user/profile', profileData);
  return res.data;
};

export const updatePreferencesApi = async (preferences) => {
  const res = await client.put('/api/user/preferences', preferences);
  return res.data;
};

export const addWeightLogApi = async (weightData) => {
  const res = await client.post('/api/user/weight', weightData);
  return res.data;
};

export const deleteAccountApi = async () => {
  const res = await client.delete('/api/user/account');
  return res.data;
};
