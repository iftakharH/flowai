export const getCurrency = () => {
  if (typeof document === 'undefined') return 'USD';
  return document.documentElement.dataset.currency || 'USD';
};

export const formatCurrency = (amount, options = {}) => new Intl.NumberFormat(
  typeof document !== 'undefined' ? document.documentElement.dataset.locale || 'en-US' : 'en-US',
  {
    style: 'currency',
    currency: options.currency || getCurrency(),
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  },
).format(Number(amount) || 0);

export const formatCompact = (amount) => {
  const value = Number(amount) || 0;
  return Math.abs(value) >= 1000 ? `${getCurrency() === 'USD' ? '$' : ''}${(value / 1000).toFixed(1)}k` : `${getCurrency() === 'USD' ? '$' : ''}${value.toFixed(0)}`;
};
