import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, FileText, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import ProGate from '../components/ProGate';
import api from '../services/api';
import useSettings from '../context/useSettings';
import { formatCurrency } from '../utils/format';

const Reports = () => {
  const { settings } = useSettings();
  const [report, setReport] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings.plan !== 'pro') return undefined;
    let active = true;
    api.get(`/reports/monthly?month=${month}`)
      .then(({ data }) => {
        if (!active) return;
        setReport(data);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Report unavailable');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month, settings.plan]);

  const monthLabel = useMemo(() => {
    const date = new Date(`${month}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) return month;
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  }, [month]);

  const generatedOn = useMemo(() => new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date()), []);

  const totals = report?.totals || [];
  const incomeRow = totals.find((item) => item._id === 'income');
  const expenseRow = totals.find((item) => item._id === 'expense');
  const income = Number(incomeRow?.total) || 0;
  const spent = Number(expenseRow?.total) || 0;
  const net = income - spent;
  const topCategory = report?.categories?.[0]?.total || 1;

  const changeMonth = (event) => {
    setLoading(true);
    setMonth(event.target.value);
  };

  return (
    <AppLayout>
      <div className="space-y-7 pb-4">
        <header className="page-header print-hide">
          <div>
            <p className="eyebrow">A monthly read</p>
            <h1 className="page-title">Reports that tell a story.</h1>
            <p className="page-subtitle">See where the month went and what changed from the inside out.</p>
          </div>
          <FileText className="text-[var(--sage-dark)]" size={24} />
        </header>

        <ProGate
          title="Monthly reports are a Pro feature"
          copy="Turn your ledger into a clean monthly review you can save or share."
        >
          <section className="panel print-hide flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-note">Choose a month</p>
              <input
                className="field-control mt-2"
                type="month"
                value={month}
                onChange={changeMonth}
                aria-label="Report month"
              />
            </div>
            <button type="button" className="button-secondary" onClick={() => window.print()}>
              <Download size={16} /> Print / save
            </button>
          </section>

          {loading && (
            <div className="panel flex min-h-48 items-center justify-center p-8 text-[var(--muted)]">
              <Loader2 size={20} className="mr-2 animate-spin" /> Building your report
            </div>
          )}

          {!loading && error && (
            <div className="empty-state panel p-8"><div><p>{error}</p></div></div>
          )}

          {!loading && !error && report && (
            <div className="report-document">
              <div className="print-report-head">
                <div className="brand-lockup">
                  <span className="brand-mark"><FileText size={17} /></span>
                  <span><span className="brand-name">FlowAI</span><span className="brand-note">personal finance</span></span>
                </div>
                <div className="print-report-title">
                  <span>Monthly report</span>
                  <strong>{monthLabel}</strong>
                </div>
                <div className="print-report-meta">
                  <span>Generated</span>
                  <strong>{generatedOn}</strong>
                </div>
              </div>

              <section className="report-summary">
                <div><span>Month</span><strong>{monthLabel}</strong></div>
                <div><span>Money in</span><strong>{formatCurrency(income)}</strong></div>
                <div><span>Money out</span><strong>{formatCurrency(spent)}</strong></div>
                <div>
                  <span>Net change</span>
                  <strong className={net >= 0 ? 'status-positive' : 'status-negative'}>
                    {net >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {formatCurrency(Math.abs(net))}
                  </strong>
                </div>
              </section>

              <section className="report-totals">
                <div className="report-total-card">
                  <span>Income</span>
                  <strong>{formatCurrency(income)}</strong>
                  <small>{incomeRow?.count || 0} entries</small>
                </div>
                <div className="report-total-card">
                  <span>Spent</span>
                  <strong>{formatCurrency(spent)}</strong>
                  <small>{expenseRow?.count || 0} entries</small>
                </div>
                <div className="report-total-card">
                  <span>Top category</span>
                  <strong>{report.categories?.[0]?._id || 'None yet'}</strong>
                  <small>{formatCurrency(report.categories?.[0]?.total || 0)} this month</small>
                </div>
              </section>

              <section className="panel p-5 md:p-7">
                <div className="section-heading">
                  <div><p className="section-note">Where it went</p><h2 className="section-title">Spending by category</h2></div>
                  <BarChart3 size={19} className="text-[var(--sage-dark)]" />
                </div>
                {report.categories?.length ? (
                  <div className="report-categories">
                    {report.categories.map((item) => (
                      <div key={item._id}>
                        <div className="flex justify-between gap-3">
                          <span>{item._id}</span>
                          <strong>{formatCurrency(item.total)}</strong>
                        </div>
                        <div className="health-track">
                          <span style={{ width: `${Math.min(100, (item.total / topCategory) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted)]">No expenses in this month yet.</p>
                )}
              </section>

              <div className="print-report-footer">
                <span>FlowAI · Private financial clarity</span>
                <span>{monthLabel} · Generated {generatedOn}</span>
              </div>
            </div>
          )}
        </ProGate>
      </div>
    </AppLayout>
  );
};

export default Reports;
