import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AppLayout from '../components/AppLayout';
import AffordabilityWidget from '../components/AffordabilityWidget';
import ProGate from '../components/ProGate';
import api from '../services/api';
import { formatCompact, formatCurrency } from '../utils/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <p>{label}</p>
      {payload.map((entry) => (
        <span key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name} {formatCurrency(entry.value)}
        </span>
      ))}
    </div>
  );
};

const Metric = ({ label, value, detail, tone = 'sage', trend }) => (
  <article className={`metric-card ${tone === 'coral' ? 'metric-negative' : ''}`}>
    <div className="flex items-center justify-between gap-3">
      <span className="metric-label">{label}</span>
      {trend !== undefined && (
        <span className={`metric-trend ${trend >= 0 ? 'status-positive' : 'status-negative'}`}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="metric-value">{value}</p>
    <p className="metric-detail">{detail}</p>
  </article>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [flowSeries, setFlowSeries] = useState({ daily: [], monthly: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('flow');
  const [smart, setSmart] = useState({ recurring: [], anomalies: [], forecast: null });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/insights/overview');
      setSummary(data.summary || {});
      setWeekly(data.weekly || null);
      setFlowSeries(data.flow || { daily: [], monthly: [] });
      setTransactions(data.recentTransactions || []);
      setSmart(data.smart || { recurring: [], anomalies: [], forecast: null });
    } catch (err) {
      console.error('FlowAI: failed to load overview', err);
      setError(err.response?.data?.message || 'The overview could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate() || 1;
    const daysLeft = Math.max(1, daysInMonth - daysPassed + 1);
    const thisIncome = Number(summary?.monthIncome) || 0;
    const thisExpense = Number(summary?.monthExpense) || 0;
    const lastIncome = Number(summary?.lastMonthIncome) || 0;
    const lastExpense = Number(summary?.lastMonthExpense) || 0;
    const balance = Number(summary?.remainingBalance) || 0;
    const dailyBurn = thisExpense / daysPassed;
    const projectedExpense = thisExpense + dailyBurn * daysLeft;
    const topCategory = summary?.topCategory
      ? [summary.topCategory.name, summary.topCategory.amount]
      : ['No category yet', 0];

    return {
      balance,
      thisIncome,
      thisExpense,
      safeToSpend: balance > 0 ? balance / daysLeft : 0,
      dailyBurn,
      projectedExpense,
      topCategory,
      txCount: Number(summary?.totalTransactions) || 0,
      incomeTrend: lastIncome > 0 ? Math.round(((thisIncome - lastIncome) / lastIncome) * 100) : undefined,
      expenseTrend: lastExpense > 0 ? Math.round(((thisExpense - lastExpense) / lastExpense) * 100) : undefined,
      flowData: (flowSeries.daily || []).map((item) => ({
        name: item.label,
        income: item.income,
        expense: item.expense,
      })),
      compareData: (flowSeries.monthly || []).map((item) => ({
        name: item.label,
        income: item.income,
        expense: item.expense,
      })),
      weekSpend: Number(weekly?.currentSpend) || 0,
      weekPrevious: Number(weekly?.previousSpend) || 0,
      weekChange: weekly?.changePercent ?? null,
      weekEntries: Number(weekly?.transactionCount) || 0,
      weekTopCategory: weekly?.topCategory || null,
    };
  }, [flowSeries, summary, weekly]);

  const notes = useMemo(() => {
    const items = [];
    if (metrics.projectedExpense > metrics.thisIncome && metrics.thisIncome > 0) {
      items.push({
        title: 'Your current pace is high',
        copy: `At ${formatCompact(metrics.dailyBurn)} a day, spending may pass this month's income.`,
        tone: 'coral',
      });
    }
    if (metrics.topCategory[1] > 0) {
      items.push({
        title: `${metrics.topCategory[0]} leads spending`,
        copy: `${formatCurrency(metrics.topCategory[1])} has gone there this month.`,
        tone: 'sage',
      });
    }
    if (metrics.balance > 0) {
      items.push({
        title: 'A daily limit keeps the month calm',
        copy: `${formatCompact(metrics.safeToSpend)} is available per day through month end.`,
        tone: 'neutral',
      });
    }
    if (!items.length) {
      items.push({
        title: 'Your picture is still forming',
        copy: 'Add an income or expense to start seeing useful patterns.',
        tone: 'neutral',
      });
    }
    return items;
  }, [metrics]);

  const weeklyNote = useMemo(() => {
    if (!weekly || metrics.weekEntries === 0) {
      return 'Add one entry this week and FlowAI will start a weekly read.';
    }
    if (metrics.weekChange === null) {
      return `You spent ${formatCurrency(metrics.weekSpend)} this week. Next week, FlowAI can compare it.`;
    }
    if (metrics.weekChange <= 0) {
      return `You spent ${formatCurrency(Math.abs(metrics.weekSpend - metrics.weekPrevious))} less than last week. Keep the pace.`;
    }
    return `Spending is up ${formatCurrency(metrics.weekSpend - metrics.weekPrevious)} versus last week${metrics.weekTopCategory ? `. ${metrics.weekTopCategory.name} is the main driver.` : '.'}`;
  }, [weekly, metrics]);

  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-7">
          <div className="h-40 animate-pulse rounded-2xl bg-[var(--surface-3)]" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-[var(--surface-3)]" />)}
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-[var(--surface-3)]" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="empty-state panel p-8">
          <div>
            <CircleAlert className="mx-auto mb-4 text-[#a6573c]" size={28} />
            <h1 className="m-0 text-2xl font-semibold tracking-tight">The overview is unavailable</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">{error}</p>
            <button type="button" onClick={fetchData} className="button-primary mt-5">Try again</button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const savingsRate = metrics.thisIncome > 0
    ? Math.max(0, Math.round(((metrics.thisIncome - metrics.thisExpense) / metrics.thisIncome) * 100))
    : 0;
  const projectedKeep = metrics.thisIncome - metrics.projectedExpense;
  const balanceProgress = metrics.balance > 0 ? Math.min(100, Math.max(8, (metrics.balance / Math.max(metrics.thisIncome, metrics.balance, 1)) * 100)) : 4;

  return (
    <AppLayout>
      <div className="space-y-7 pb-4">
        <header className="page-header">
          <div>
            <p className="eyebrow">{todayLabel}</p>
            <h1 className="page-title">Your money today.</h1>
            <p className="page-subtitle">See what is safe, what changed, and what needs attention.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="panel flex items-center gap-3 px-4 py-3 text-sm text-[var(--muted)]">
              <Activity size={17} className="text-[var(--sage-dark)]" />
              <span>{metrics.txCount} recorded {metrics.txCount === 1 ? 'transaction' : 'transactions'}</span>
            </div>
            <Link to="/transactions?new=1" className="button-primary">
              <Plus size={16} /> Log spending
            </Link>
          </div>
        </header>

        {metrics.txCount === 0 && (
          <section className="panel getting-started p-5 md:p-7">
            <span className="getting-started-icon"><Sparkles size={22} /></span>
            <div className="getting-started-copy">
              <p className="section-note">Start here</p>
              <h2 className="section-title">One entry is enough to begin.</h2>
              <p>Add income and one recent purchase. FlowAI turns them into a safe-to-spend number and a weekly read.</p>
              <div className="getting-started-actions">
                <Link to="/transactions?new=1" className="button-primary"><Plus size={16} /> Add your first entry</Link>
                <Link to="/budget" className="button-secondary">Set a budget</Link>
              </div>
            </div>
          </section>
        )}

        <section className="panel balance-panel p-5 md:p-7">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="section-note">Available balance</p>
              <p className={`balance-value ${metrics.balance < 0 ? 'status-negative' : ''}`}>{formatCurrency(metrics.balance)}</p>
              <div className={`flex items-center gap-2 text-sm font-semibold ${metrics.balance >= 0 ? 'status-positive' : 'status-negative'}`}>
                {metrics.balance >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {metrics.balance >= 0 ? 'You are in positive flow' : 'Spending is ahead of income'}
              </div>
            </div>
            <div className="balance-aside">
              <p className="section-note">Expected monthly spending</p>
              <p className="projection-value">{formatCurrency(metrics.projectedExpense)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">At the current daily pace</p>
            </div>
          </div>
          <div className="mt-7">
            <div className="balance-track"><span style={{ width: `${balanceProgress}%` }} /></div>
            <div className="mt-2 flex justify-between text-xs text-[var(--muted)]">
              <span>Current position</span>
              <span>{formatCompact(metrics.safeToSpend)} safe per day</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Income this month" value={formatCurrency(metrics.thisIncome)} detail="Money in" trend={metrics.incomeTrend} />
          <Metric label="Spent this month" value={formatCurrency(metrics.thisExpense)} detail="Money out" tone="coral" trend={metrics.expenseTrend} />
          <Metric label="Comfortable to spend today" value={formatCurrency(metrics.safeToSpend)} detail="Based on your balance and days left" />
          <Metric label="Spent this week" value={formatCurrency(metrics.weekSpend)} detail={metrics.weekChange === null ? 'First week of tracking' : `${metrics.weekChange > 0 ? '+' : ''}${metrics.weekChange}% vs last week`} tone="coral" />
        </section>

        <section className="panel weekly-recap p-5 md:p-7">
          <div className="section-heading">
            <div><p className="section-note">The last seven days</p><h2 className="section-title">Your week, in one read.</h2></div>
            <CalendarDays size={19} className="text-[var(--sage-dark)]" />
          </div>
          <div className="weekly-recap-grid">
            <div>
              <span>Spent this week</span>
              <strong>{formatCurrency(metrics.weekSpend)}</strong>
              <p>{metrics.weekChange === null ? 'No previous week to compare yet.' : `${metrics.weekChange > 0 ? 'Up' : 'Down'} ${Math.abs(metrics.weekChange)}% versus last week.`}</p>
            </div>
            <div>
              <span>Top category</span>
              <strong>{metrics.weekTopCategory?.name || 'No category yet'}</strong>
              <p>{metrics.weekTopCategory ? `${formatCurrency(metrics.weekTopCategory.amount)} of this week's spend.` : 'Add an expense to see the pattern.'}</p>
            </div>
            <div>
              <span>Entries this week</span>
              <strong>{metrics.weekEntries}</strong>
              <p>{metrics.weekEntries ? 'Every entry makes the next read sharper.' : 'One entry is enough to begin.'}</p>
            </div>
          </div>
          <div className="weekly-recap-note">
            <Sparkles size={16} />
            <p>{weeklyNote}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.65fr)]">
          <div className="panel chart-panel p-5 md:p-7">
            <div className="section-heading">
              <div>
                <p className="section-note">Money in motion</p>
                <h2 className="section-title">Flow over time</h2>
              </div>
              <div className="chart-tabs" role="tablist" aria-label="Flow chart range">
                <button type="button" role="tab" aria-selected={activeChart === 'flow'} className={activeChart === 'flow' ? 'chart-tab-active' : ''} onClick={() => setActiveChart('flow')}>7 days</button>
                <button type="button" role="tab" aria-selected={activeChart === 'compare'} className={activeChart === 'compare' ? 'chart-tab-active' : ''} onClick={() => setActiveChart('compare')}>6 months</button>
              </div>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'flow' ? (
                  <AreaChart data={metrics.flowData} margin={{ top: 10, right: 4, bottom: 0, left: -18 }}>
                    <defs>
                      <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#657b67" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#657b67" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(23,32,29,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: '#718078', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#718078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#657b67" strokeWidth={2} fill="url(#incomeFill)" />
                    <Area type="monotone" dataKey="expense" name="Spent" stroke="#c97958" strokeWidth={2} fill="none" />
                  </AreaChart>
                ) : (
                  <BarChart data={metrics.compareData} margin={{ top: 10, right: 4, bottom: 0, left: -18 }}>
                    <CartesianGrid vertical={false} stroke="rgba(23,32,29,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: '#718078', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#718078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#718078' }} />
                    <Bar dataKey="income" name="Income" fill="#657b67" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Spent" fill="#c97958" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel p-5 md:p-7">
            <div className="section-heading">
              <div>
                <p className="section-note">A little context</p>
                <h2 className="section-title">Worth noticing</h2>
              </div>
              <Sparkles size={19} className="text-[var(--sage-dark)]" />
            </div>
            <div className="insight-list">
              {notes.map((note) => (
                <div key={note.title} className={`insight-item insight-${note.tone}`}>
                  <span className="insight-icon">{note.tone === 'coral' ? <CircleAlert size={15} /> : <Check size={15} />}</span>
                  <div>
                    <p className="insight-title">{note.title}</p>
                    <p className="insight-copy">{note.copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-2 border-t border-[var(--soft-line)] pt-4 text-xs text-[var(--muted)]">
              <Clock3 size={13} /> Updated just now
            </div>
          </div>
        </section>

        <section className="panel p-5 md:p-7">
          <div className="section-heading"><div><p className="section-note">Quiet automation</p><h2 className="section-title">Signals worth seeing</h2></div><Sparkles size={19} className="text-[var(--sage-dark)]" /></div>
          <ProGate title="Your money has more patterns to show you" copy="Pro finds recurring commitments, unusual spending, and the likely shape of the next 30 days.">
            <div className="signals-grid">
              <div className="signal-card"><span>Recurring commitments</span><strong>{smart.recurring.length}</strong><p>{smart.recurring[0] ? `${smart.recurring[0].category} is about ${formatCurrency(smart.recurring[0].monthlyCost)} a month.` : 'No repeating pattern yet.'}</p></div>
              <div className="signal-card"><span>Unusual activity</span><strong>{smart.anomalies.length}</strong><p>{smart.anomalies[0]?.reason || 'Nothing unusual in the last 90 days.'}</p></div>
              <div className="signal-card"><span>Next 30 days</span><strong>{smart.forecast ? formatCurrency(smart.forecast.next30Days) : '--'}</strong><p>{smart.forecast ? `${formatCurrency(smart.forecast.projectedBalance)} projected balance.` : 'Forecast appears once there is enough history.'}</p></div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--soft-line)] pt-4">
              <span className="text-xs text-[var(--muted)]">Detected from your last 400 days of entries.</span>
              <Link to="/subscriptions" className="text-sm font-semibold text-[var(--sage-dark)] hover:underline">Open subscription watch</Link>
            </div>
          </ProGate>
        </section>

        <AffordabilityWidget />

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="panel p-5 md:p-7">
            <div className="section-heading">
              <div>
                <p className="section-note">Latest entries</p>
                <h2 className="section-title">Recent activity</h2>
              </div>
              <a href="/transactions" className="text-sm font-semibold text-[var(--sage-dark)] hover:underline">View ledger</a>
            </div>
            <div className="recent-list">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="recent-row">
                  <span className={`recent-icon ${transaction.type === 'income' ? 'recent-income' : 'recent-expense'}`}>
                    {transaction.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="recent-title">{transaction.category}</p>
                    <p className="recent-note">{transaction.note || 'No note added'}</p>
                  </div>
                  <span className={`recent-amount ${transaction.type === 'income' ? 'status-positive' : 'status-negative'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
              {!transactions.length && (
                <div className="empty-state"><div><WalletCards size={28} className="mx-auto mb-3" /><p className="m-0 text-sm">Your first entry will appear here.</p></div></div>
              )}
            </div>
          </div>

          <div className="panel p-5 md:p-7">
            <div className="section-heading">
              <div>
                <p className="section-note">This month</p>
                <h2 className="section-title">Financial health</h2>
              </div>
              <ShieldCheck size={19} className="text-[var(--sage-dark)]" />
            </div>
            <div className="health-list">
              <div className="health-row"><span>Savings rate</span><strong>{savingsRate}%</strong><div className="health-track"><span style={{ width: `${Math.min(100, savingsRate)}%` }} /></div></div>
              <div className="health-row"><span>Top category</span><strong>{metrics.topCategory[0]}</strong><div className="health-track"><span style={{ width: `${metrics.topCategory[1] > 0 ? 64 : 4}%` }} /></div></div>
              <div className="health-row"><span>Daily spending</span><strong>{formatCurrency(metrics.dailyBurn)}</strong><div className="health-track"><span style={{ width: `${Math.min(100, metrics.thisIncome ? (metrics.thisExpense / metrics.thisIncome) * 100 : 4)}%` }} /></div></div>
            </div>
            <div className="score-strip">
              <div>
                <p className="section-note">{projectedKeep >= 0 ? 'Projected to keep' : 'Projected shortfall'}</p>
                <strong>{metrics.txCount ? formatCurrency(Math.abs(projectedKeep)) : '--'}</strong>
              </div>
              <p>{metrics.txCount ? 'If the current pace holds through month end.' : 'Add a transaction to start the reading.'}</p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
