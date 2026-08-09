import client from './client';

export const logFreshnessScanApi = async (freshnessData) => {
  const res = await client.post('/api/freshness/log', freshnessData);
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
