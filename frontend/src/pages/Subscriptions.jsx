import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CircleDollarSign,
  EyeOff,
  Loader2,
  Repeat2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import ProGate from '../components/ProGate';
import api from '../services/api';
import useSettings from '../context/useSettings';
import { formatCurrency } from '../utils/format';

const formatDate = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const confidenceCopy = {
  high: 'High confidence',
  medium: 'Likely',
  low: 'Worth checking',
};

const Subscriptions = () => {
  const { settings } = useSettings();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openKey, setOpenKey] = useState('');
  const [dismissing, setDismissing] = useState('');

  useEffect(() => {
    if (settings.plan !== 'pro') return undefined;
    let active = true;
    api.get('/smart/recurring')
      .then(({ data }) => {
        if (!active) return;
        setItems(data.items || []);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Recurring charges could not be loaded.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [settings.plan]);

  const totals = useMemo(() => {
    const monthly = items.reduce((sum, item) => sum + (Number(item.monthlyCost) || 0), 0);
    const annual = items.reduce((sum, item) => sum + (Number(item.annualCost) || 0), 0);
    const dated = items
      .filter((item) => item.nextExpectedDate)
      .sort((a, b) => new Date(a.nextExpectedDate) - new Date(b.nextExpectedDate));
    return { monthly, annual, next: dated[0] || null };
  }, [items]);

  const dismiss = async (item) => {
    const previous = items;
    setDismissing(item.key);
    setItems((current) => current.filter((entry) => entry.key !== item.key));
    try {
      await api.post(`/smart/recurring/${encodeURIComponent(item.key)}/dismiss`);
      toast.custom((toastItem) => (
        <div className="undo-toast">
          <span>{item.name} removed from this list</span>
          <button
            type="button"
            onClick={async () => {
              toast.dismiss(toastItem.id);
              try {
                await api.delete(`/smart/recurring/${encodeURIComponent(item.key)}/dismiss`);
                setItems((current) => [...current, item].sort((a, b) => b.monthlyCost - a.monthlyCost));
                toast.success(`${item.name} restored`);
              } catch (err) {
                toast.error(err.response?.data?.message || 'That charge could not be restored.');
              }
            }}
          >
            Undo
          </button>
        </div>
      ), { duration: 6000 });
    } catch (err) {
      setItems(previous);
      toast.error(err.response?.data?.message || 'That charge could not be dismissed.');
    } finally {
      setDismissing('');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-7 pb-4">
        <header className="page-header">
          <div>
            <p className="eyebrow">The quiet cost of keeping things</p>
            <h1 className="page-title">Recurring charges.</h1>
            <p className="page-subtitle">See what keeps coming back, what it costs over a year, and what deserves a second look.</p>
          </div>
          <Repeat2 className="text-[var(--sage-dark)]" size={24} />
        </header>

        <ProGate
          title="Subscription watch is a Pro feature"
          copy="Pro finds repeating charges, estimates the yearly cost, and shows what is due next."
        >
          {loading && (
            <div className="panel flex min-h-40 items-center justify-center p-8 text-[var(--muted)]">
              <Loader2 size={20} className="mr-2 animate-spin" /> Finding repeating charges
            </div>
          )}

          {!loading && error && (
            <div className="empty-state panel p-8"><div><p>{error}</p></div></div>
          )}

          {!loading && !error && (
            <>
              <section className="subscription-summary">
                <article className="panel subscription-stat">
                  <span>Monthly equivalent</span>
                  <strong>{formatCurrency(totals.monthly, { maximumFractionDigits: 2 })}</strong>
                  <p>{items.length} repeating {items.length === 1 ? 'charge' : 'charges'} found</p>
                </article>
                <article className="panel subscription-stat">
                  <span>Yearly commitment</span>
                  <strong>{formatCurrency(totals.annual)}</strong>
                  <p>The same charges across 12 months</p>
                </article>
                <article className="panel subscription-stat">
                  <span>Next expected</span>
                  <strong className="subscription-next">{totals.next ? formatDate(totals.next.nextExpectedDate) : 'None yet'}</strong>
                  <p>{totals.next ? `${totals.next.name} · ${formatCurrency(totals.next.amount, { maximumFractionDigits: 2 })}` : 'Add a few months of entries to see a pattern'}</p>
                </article>
              </section>

              {!items.length && (
                <section className="panel empty-state min-h-64 p-8">
                  <div>
                    <Repeat2 size={28} className="mx-auto mb-3 text-[var(--sage-dark)]" />
                    <h2 className="m-0 text-xl font-semibold">No repeating charges yet.</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                      FlowAI looks for two or more similar charges between 6 and 420 days apart.
                      Add a few months of entries and the pattern will appear here.
                    </p>
                  </div>
                </section>
              )}

              {items.length > 0 && (
                <section className="subscription-list" aria-live="polite">
                  {items.map((item) => (
                    <article className="panel subscription-card" key={item.key}>
                      <div className="subscription-card-main">
                        <span className="account-type-icon"><Repeat2 size={18} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="subscription-title-row">
                            <h2>{item.name}</h2>
                            <span className={`subscription-confidence confidence-${item.confidence}`}>
                              {confidenceCopy[item.confidence] || 'Worth checking'}
                            </span>
                          </div>
                          <p>{item.category} · {item.intervalLabel} · {item.occurrences} charges seen</p>
                        </div>
                        <div className="subscription-amount">
                          <strong>{formatCurrency(item.amount, { maximumFractionDigits: 2 })}</strong>
                          <span>{formatCurrency(item.annualCost)} / year</span>
                        </div>
                      </div>

                      <div className="subscription-meta">
                        <div><span>Next expected</span><strong>{formatDate(item.nextExpectedDate)}</strong></div>
                        <div><span>Monthly equivalent</span><strong>{formatCurrency(item.monthlyCost, { maximumFractionDigits: 2 })}</strong></div>
                        <div><span>Last charge</span><strong>{formatDate(item.lastDate)}</strong></div>
                      </div>

                      <div className="subscription-actions">
                        <button
                          type="button"
                          className="button-quiet"
                          onClick={() => setOpenKey(openKey === item.key ? '' : item.key)}
                          aria-expanded={openKey === item.key}
                        >
                          <Sparkles size={15} /> {openKey === item.key ? 'Hide review steps' : 'Review this charge'}
                        </button>
                        <button
                          type="button"
                          className="button-quiet"
                          onClick={() => dismiss(item)}
                          disabled={dismissing === item.key}
                        >
                          {dismissing === item.key ? <Loader2 size={15} className="animate-spin" /> : <EyeOff size={15} />}
                          Not a subscription
                        </button>
                      </div>

                      {openKey === item.key && (
                        <div className="subscription-playbook">
                          <p className="section-note">A safe review</p>
                          <ol>
                            <li>Find the latest receipt for {item.name} and confirm the renewal date.</li>
                            <li>Check whether the annual plan is cheaper than paying every {item.intervalLabel.toLowerCase()}.</li>
                            <li>If it is no longer useful, cancel from the provider account and keep the confirmation.</li>
                          </ol>
                          <p className="subscription-playbook-note">
                            FlowAI never cancels anything for you. This is a checklist, not an action.
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </section>
              )}

              <section className="panel subscription-explainer p-5 md:p-7">
                <div className="section-heading">
                  <div><p className="section-note">How this works</p><h2 className="section-title">Patterns, not guesses.</h2></div>
                  <ShieldCheck size={19} className="text-[var(--sage-dark)]" />
                </div>
                <div className="subscription-explainer-grid">
                  <div><CalendarClock size={18} /><strong>Same rhythm</strong><p>We compare the gap between charges, from weekly to yearly.</p></div>
                  <div><CircleDollarSign size={18} /><strong>Same shape</strong><p>Similar amounts and categories are grouped, then ranked by yearly cost.</p></div>
                  <div><EyeOff size={18} /><strong>You stay in control</strong><p>Dismiss anything that is not a subscription. The list learns from you.</p></div>
                </div>
              </section>
            </>
          )}
        </ProGate>
      </div>
    </AppLayout>
  );
};

export default Subscriptions;
