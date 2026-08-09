import client from './client';

export const getNotificationsApi = async () => {
  const res = await client.get('/api/notifications');
  const list = res.data?.data || res.data || [];
  return list.map((item) => ({
    id: item._id,
    title: item.title || 'System Alert',
    message: item.message || '',
    unread: !item.read,
    time: item.createdAt 
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : 'Just now'
  }));
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
