import client from './client';

export const getNotificationsApi = async () => {
  const res = await client.get('/api/notifications');
  return res.data;
};

export const markNotificationReadApi = async (id) => {
  const res = await client.put(`/api/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsReadApi = async () => {
  const res = await client.put('/api/notifications/read-all');
  return res.data;
};

export const deleteNotificationApi = async (id) => {
  const res = await client.delete(`/api/notifications/${id}`);
  return res.data;
};
