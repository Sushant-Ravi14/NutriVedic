import client from './client';

export const getReportsAnalyticsApi = async () => {
  const res = await client.get('/api/analytics/weekly');
  return res.data;
};

export const getDashboardAnalyticsApi = async () => {
  const res = await client.get('/api/analytics/dashboard');
  return res.data;
};

export const getMonthlyAnalyticsApi = async () => {
  const res = await client.get('/api/analytics/monthly');
  return res.data;
};

export const getTrendsApi = async () => {
  const res = await client.get('/api/analytics/trends');
  return res.data;
};

export const exportDataApi = async (params) => {
  const res = await client.post('/api/analytics/export', params);
  return res.data;
};
