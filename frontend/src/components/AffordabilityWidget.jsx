import React, { useState } from 'react';
import api from '../services/api';
import { Activity, AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatCurrency } from '../utils/format';

const AffordabilityWidget = () => {
  const [cost, setCost] = useState('');
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (event) => {
    event.preventDefault();
    if (!cost || Number(cost) <= 0) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/insights/affordability', { cost: Number(cost) });
      setInsight(data);
    } catch (err) {
      setError(err.response?.data?.message || 'The purchase could not be checked.');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    if (!insight?.canAfford) return { icon: XCircle, label: 'Hold off', className: 'decision-danger' };
    if (insight.message.includes('very little buffer')) return { icon: AlertTriangle, label: 'Take care', className: 'decision-warn' };
    return { icon: CheckCircle2, label: 'Looks comfortable', className: 'decision-safe' };
  };

  const status = getStatus();
  const StatusIcon = status.icon;
  const impact = insight?.currentBalance > 0 ? (insight.cost / insight.currentBalance) * 100 : 0;

  return (
    <section className="panel p-5 md:p-7">
      <div className="section-heading">
        <div>
          <p className="section-note">Before you buy</p>
          <h2 className="section-title">Purchase check</h2>
        </div>
        <Activity size={19} className="text-[var(--sage-dark)]" />
      </div>
      <p className="mb-5 max-w-xl text-sm leading-6 text-[var(--muted)]">
        Test a purchase against your balance and current spending pace.
      </p>

      <form onSubmit={handleCheck} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label className="field-label" htmlFor="purchase-cost">Purchase amount</label>
          <Input
            id="purchase-cost"
            type="number"
            min="0.01"
            step="0.01"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            placeholder="0.00"
            icon={<span className="font-semibold">$</span>}
          />
        </div>
        <Button type="submit" disabled={loading || !cost}>
          {loading ? <Loader2 size={17} className="animate-spin" /> : 'Check purchase'}
        </Button>
      </form>

      {error && <p className="error-message mt-4">{error}</p>}

      {insight && !error && (
        <div className={`decision-panel ${status.className}`}>
          <div className="flex items-start gap-3">
            <StatusIcon size={21} className="mt-0.5 shrink-0" />
            <div>
              <p className="decision-label">{status.label}</p>
              <p className="mt-1 text-sm leading-6">{insight.message}</p>
            </div>
          </div>
          <div className="decision-stats">
            <div><span>Purchase impact</span><strong>{impact.toFixed(1)}%</strong></div>
            <div><span>Days left this month</span><strong>{insight.daysLeft}</strong></div>
            <div><span>Balance after purchase</span><strong>{formatCurrency(insight.currentBalance - insight.cost)}</strong></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AffordabilityWidget;
