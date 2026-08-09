import client from './client';

export const logFreshnessScanApi = async (freshnessData) => {
  const isFormData = freshnessData instanceof FormData;
  const res = await client.post('/api/freshness/log', freshnessData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
  return res.data;
};

export const getInventoryItemsApi = async () => {
  const res = await client.get('/api/freshness/inventory');
  return res.data;
};

export const getFreshnessAlertsApi = async () => {
  const res = await client.get('/api/freshness/alerts');
  return res.data;
};

export const deleteInventoryItemApi = async (itemId) => {
  const res = await client.delete(`/api/freshness/${itemId}`);
  return res.data;
};
