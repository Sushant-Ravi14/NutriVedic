import client from './client';

export const createSubscriptionOrderApi = async (planId) => {
  const res = await client.post('/api/subscription/create-order', { planId });
  return res.data;
};

export const verifySubscriptionApi = async (paymentDetails) => {
  const res = await client.post('/api/subscription/verify', paymentDetails);
  return res.data;
};
