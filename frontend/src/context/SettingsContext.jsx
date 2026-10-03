import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import useAuthContext from './useAuthContext';
import { defaultSettings, SettingsContext } from './settingsStore';

export const SettingsProvider = ({ children }) => {
  const { isSignedIn } = useAuthContext();
  const [settings, setSettings] = useState(defaultSettings);
  const visibleSettings = isSignedIn ? settings : defaultSettings;

  useEffect(() => {
    if (!isSignedIn) {
      return undefined;
    }

    let active = true;
    api.get('/settings')
      .then(({ data }) => { if (active) setSettings({ ...defaultSettings, ...data }); })
      .catch((error) => console.error('FlowAI: failed to load settings', error))

    return () => { active = false; };
  }, [isSignedIn]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = visibleSettings.theme || 'light';
    root.dataset.accent = visibleSettings.accent || 'sage';
    root.dataset.currency = visibleSettings.currency || 'USD';
    root.dataset.locale = visibleSettings.locale || 'en-US';
  }, [visibleSettings]);

  const saveSettings = async (updates) => {
    const { data } = await api.put('/settings', updates);
    setSettings((current) => ({ ...current, ...data }));
    return data;
  };

  const value = useMemo(() => ({ settings: visibleSettings, loading: false, saveSettings, setSettings }), [visibleSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
