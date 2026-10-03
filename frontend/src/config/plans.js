export const plans = {
  free: {
    name: 'Free',
    price: 0,
    cadence: 'forever',
    description: 'The calm essentials for seeing where your money goes.',
    features: ['Unlimited manual entries', 'Monthly budgets', 'Purchase check', '7-day flow view'],
  },
  pro: {
    name: 'Pro',
    price: 5,
    yearlyPrice: 45,
    cadence: 'per month',
    description: 'A private money signal system for people who want to move with confidence.',
    features: ['Recurring payment detection', 'Anomaly and forecast signals', 'Savings goals and reports', 'Unlimited CSV imports'],
  },
};

export const proFeatureNames = ['Signals', 'Forecasts', 'Goals', 'Reports'];
