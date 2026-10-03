import React, { useState } from 'react';
import { Download, Moon, Palette, Plus, Settings as SettingsIcon, Sun, Trash2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import api from '../services/api';
import useSettings from '../context/useSettings';
import { plans } from '../config/plans';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Settings = () => {
  const { settings, saveSettings } = useSettings();
  const [displayName, setDisplayName] = useState(settings.displayName || '');
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (updates, message = 'Settings saved') => {
    setSaving(true);
    try { await saveSettings(updates); toast.success(message); } catch (error) { toast.error(error.response?.data?.message || 'Settings could not be saved'); } finally { setSaving(false); }
  };

  const openBilling = async () => {
    try {
      const endpoint = settings.plan === 'pro' ? '/billing/portal' : '/billing/checkout';
      const { data } = await api.post(endpoint, settings.plan === 'pro' ? {} : { interval: 'month' });
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Stripe test mode is not configured yet.');
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const { data } = await api.post('/settings/categories', { name: newCategory.trim() });
      await saveSettings({ categories: data.categories });
      setNewCategory('');
      toast.success('Category added');
    } catch (error) { toast.error(error.response?.data?.message || 'Category could not be added'); }
  };

  const removeCategory = async (category) => {
    try {
      const { data } = await api.delete(`/settings/categories/${encodeURIComponent(category)}`);
      await saveSettings({ categories: data.categories });
      toast.success('Category removed');
    } catch (error) { toast.error(error.response?.data?.message || 'Category could not be removed'); }
  };

  const exportData = async (format) => {
    try {
      const { data } = await api.get(`/settings/export?format=${format}`);
      const blob = new Blob([format === 'csv' ? data : JSON.stringify(data, null, 2)], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `flowai-export.${format}`; link.click(); URL.revokeObjectURL(url);
    } catch (error) { toast.error(error.response?.data?.message || 'Export failed'); }
  };

  return (
    <AppLayout>
      <div className="space-y-7 pb-4">
        <header className="page-header mb-3"><div><p className="eyebrow">Make the app fit your life</p><h1 className="page-title">Your settings.</h1><p className="page-subtitle">Personalize the way FlowAI reads your money.</p></div><SettingsIcon className="text-[var(--sage-dark)]" size={24} /></header>
        <div className="settings-layout">
          <section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Profile</p><h2 className="section-title">How should we call you?</h2></div><UserRound size={19} className="text-[var(--sage-dark)]" /></div><div className="grid gap-4"><div><label className="field-label" htmlFor="display-name">Display name</label><Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name" /></div><Button disabled={saving} onClick={() => save({ displayName })}>Save profile</Button></div></section>
          <section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Appearance</p><h2 className="section-title">A view that feels like yours.</h2></div><Palette size={19} className="text-[var(--sage-dark)]" /></div><div className="grid gap-4"><div><span className="field-label">Theme</span><div className="segmented-control"><button className={settings.theme === 'light' ? 'segmented-active' : ''} onClick={() => save({ theme: 'light' }, 'Light theme selected')} type="button"><Sun size={15} /> Light</button><button className={settings.theme === 'dark' ? 'segmented-active' : ''} onClick={() => save({ theme: 'dark' }, 'Dark theme selected')} type="button"><Moon size={15} /> Dark</button></div></div><div><label className="field-label" htmlFor="currency">Currency</label><select id="currency" className="field-control" value={settings.currency} onChange={(event) => save({ currency: event.target.value }, 'Currency updated')}><option value="USD">USD - US dollar</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - Pound</option><option value="BDT">BDT - Taka</option><option value="INR">INR - Rupee</option></select></div><div><span className="field-label">Accent</span><div className="accent-options">{['sage', 'amber', 'blue', 'plum'].map((accent) => <button key={accent} type="button" className={`accent-swatch accent-${accent} ${settings.accent === accent ? 'accent-selected' : ''}`} onClick={() => save({ accent }, 'Accent updated')} aria-label={`${accent} accent`} />)}</div></div></div></section>
          <section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Categories</p><h2 className="section-title">Use words you recognize.</h2></div><Plus size={19} className="text-[var(--sage-dark)]" /></div><div className="flex gap-2"><Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Add a category" /><Button onClick={addCategory}>Add</Button></div><div className="category-list">{(settings.categories || []).map((category) => <span key={category} className="category-chip">{category}<button type="button" onClick={() => removeCategory(category)} aria-label={`Remove ${category}`}><Trash2 size={13} /></button></span>)}</div></section>
          <section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Your plan</p><h2 className="section-title">{settings.plan === 'pro' ? 'FlowAI Pro' : 'FlowAI Free'}</h2></div><span className="plan-badge">{settings.plan === 'pro' ? 'Active' : 'Current'}</span></div><p className="text-sm leading-6 text-[var(--muted)]">{settings.plan === 'pro' ? plans.pro.description : plans.free.description}</p><Button variant={settings.plan === 'pro' ? 'secondary' : 'primary'} className="mt-4" onClick={openBilling}>{settings.plan === 'pro' ? 'Manage billing' : 'Explore Pro'}</Button></section>
          <section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Your data</p><h2 className="section-title">Keep a copy. Stay in control.</h2></div><Download size={19} className="text-[var(--sage-dark)]" /></div><div className="flex flex-col gap-2 sm:flex-row"><Button variant="secondary" onClick={() => exportData('json')}>Export JSON</Button><Button variant="secondary" onClick={() => exportData('csv')}>Export CSV</Button></div></section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
