import React, { useState } from 'react';
import { LockKeyhole, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useSettings from '../context/useSettings';
import { Button } from './ui/Button';

const ProGate = ({ children, title = 'This is a Pro signal', copy = 'Upgrade when you want FlowAI to watch the pattern for you.' }) => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);

  if (settings.plan === 'pro') return children;

  const startCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/billing/checkout', { interval: 'month' });
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Stripe test mode is not configured yet.');
    } finally { setLoading(false); }
  };

  return (
    <div className="pro-gate">
      <span className="pro-gate-icon"><LockKeyhole size={18} /></span>
      <div><p className="pro-gate-title"><Sparkles size={15} /> {title}</p><p className="pro-gate-copy">{copy}</p></div>
      <Button onClick={startCheckout} disabled={loading}>{loading ? 'Opening...' : 'Explore Pro'}</Button>
    </div>
  );
};

export default ProGate;
