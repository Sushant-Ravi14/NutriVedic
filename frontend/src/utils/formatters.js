/**
 * NutriVedic Formatting Utilities
 */

export const formatDate = (dateInput) => {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).toUpperCase();
};

export const formatISODate = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  return d.toISOString().split('T')[0];
};

export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatGrams = (grams) => {
  return `${Math.round(grams || 0)} g`;
};

export const formatKcal = (kcal) => {
  return `${Math.round(kcal || 0)} kcal`;
};

export const formatPercent = (val, max) => {
  if (!max || max === 0) return '0%';
  const pct = Math.min(Math.round((val / max) * 100), 100);
  return `${pct}%`;
};

export const formatDelta = (val) => {
  if (val > 0) return `+${val}`;
  return `${val}`;
};
