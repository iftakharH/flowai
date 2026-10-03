import { createContext } from 'react';

export const defaultSettings = {
  currency: 'USD',
  locale: 'en-US',
  theme: 'light',
  accent: 'sage',
  categories: [],
  dashboardPrefs: [],
  plan: 'free',
};

export const SettingsContext = createContext(null);
