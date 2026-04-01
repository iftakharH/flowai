import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../services/api';
import { 
  TrendingUp, TrendingDown, Sparkles, Activity, Target, ArrowUpRight, 
  Zap, AlertCircle, Brain, Shield, Cpu, BarChart2, 
  ArrowDownRight, Clock, ChevronRight, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(Number(amount) || 0);

const formatCompact = (amount) => {
  const n = Number(amount) || 0;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, sub, color = 'brand', trend }) => {
  const colors = {
    brand: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card p-6 md:p-8 border ${colors[color]} group cursor-default`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[.2em] mb-2">{label}</p>
      <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
      {sub && <p className="text-xs font-medium text-slate-500">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend >= 0 ? '+' : ''}{trend}% vs last month
        </div>
      )}
    </motion.div>
  );
};

const AIInsightCard = ({ title, description, tag, urgent = false }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
      urgent 
        ? 'bg-brand-500/5 border-brand-500/30 hover:border-brand-500/60' 
        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {urgent && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />}
          <p className={`text-sm font-black uppercase tracking-wide ${urgent ? 'text-brand-400' : 'text-white'}`}>{title}</p>
        </div>
        <p className="text-xs font-medium text-slate-400 leading-relaxed">{description}</p>
      </div>
      <ChevronRight size={16} className="text-slate-600 shrink-0 mt-0.5" />
    </div>
    {tag && (
      <div className="mt-3">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${urgent ? 'bg-brand-500/20 text-brand-400' : 'bg-white/5 text-slate-500'}`}>
          {tag}
        </span>
      </div>
    )}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-xs">
        <p className="text-slate-400 font-bold uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color }} className="font-black">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('flow'); // 'flow' | 'compare'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, txRes] = await Promise.all([
        api.get('/insights/summary'),
        api.get('/transactions?limit=100'),
      ]);
      setSummary(sumRes.data || {});
      setTransactions(txRes.data?.transactions || []);
    } catch (err) {
      console.error('FlowAI: Failed to sync financial matrix', err);
      setError(err.response?.data?.message || 'Neural sync interrupted. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const txArr = Array.isArray(transactions) ? transactions : [];

    const thisMonthTx = txArr.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthTx = txArr.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    const sum = (arr, type) => arr
      .filter(t => t.type === type)
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const thisIncome = sum(thisMonthTx, 'income');
    const thisExpense = sum(thisMonthTx, 'expense');
    const lastIncome = sum(lastMonthTx, 'income');
    const lastExpense = sum(lastMonthTx, 'expense');

    const daysPassed = now.getDate() || 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - daysPassed);
    const dailyBurn = daysPassed > 0 ? thisExpense / daysPassed : 0;
    const projectedExpense = thisExpense + (dailyBurn * daysLeft);

    const balance = Number(summary?.remainingBalance) || 0;
    const safeToSpend = balance > 0 ? balance / daysLeft : 0;

    const categoryTotals = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(t.amount) || 0);
    });
    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0] || ['No data', 0];

    // 7-day chart data
    const flowData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ts = d.getTime();
      const dayTx = txArr.filter(t => {
        const td = new Date(t.date);
        td.setHours(0, 0, 0, 0);
        return td.getTime() === ts;
      });
      flowData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        income: dayTx.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0),
        expense: dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0),
      });
    }

    // Monthly comparison (last 6 months)
    const compareData = [];
    for (let i = 5; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const mTx = txArr.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      compareData.push({
        name: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' }),
        income: sum(mTx, 'income'),
        expense: sum(mTx, 'expense'),
      });
    }

    const incomeTrend = lastIncome > 0 ? Math.round(((thisIncome - lastIncome) / lastIncome) * 100) : 0;
    const expenseTrend = lastExpense > 0 ? Math.round(((thisExpense - lastExpense) / lastExpense) * 100) : 0;

    return {
      thisIncome, thisExpense, balance, safeToSpend, dailyBurn,
      projectedExpense, topCategory, flowData, compareData,
      incomeTrend, expenseTrend, txCount: txArr.length,
    };
  }, [transactions, summary]);

  // ── AI Insights (dynamic based on data) ──────────────────────────────────
  const aiInsights = useMemo(() => {
    const insights = [];
    const bal = metrics.balance;
    const projected = metrics.projectedExpense;
    const income = metrics.thisIncome;

    if (projected > income && income > 0) {
      insights.push({
        title: 'Burn Rate Alert',
        description: `At your current velocity of ${formatCompact(metrics.dailyBurn)}/day, you are projected to overspend by ${formatCompact(projected - income)} this month.`,
        tag: 'Critical',
        urgent: true,
      });
    }

    if (metrics.topCategory[1] > 0) {
      const pct = income > 0 ? ((metrics.topCategory[1] / income) * 100).toFixed(0) : '?';
      insights.push({
        title: `Pressure Point: ${metrics.topCategory[0]}`,
        description: `"${metrics.topCategory[0]}" claims ${pct}% of your monthly flow. Reducing it by 15% adds ${formatCompact(metrics.topCategory[1] * 0.15)} back to your runway.`,
        tag: 'Optimize',
        urgent: false,
      });
    }

    if (bal > 0 && metrics.safeToSpend > 0) {
      insights.push({
        title: 'Daily Safe Limit',
        description: `You can safely allocate ${formatCompact(metrics.safeToSpend)}/day through end of month without risking your capital position.`,
        tag: 'Guidance',
        urgent: false,
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: 'FlowAI Calibrating',
        description: 'Add your income and expenses to unlock personalized AI guidance, predictions, and financial optimization signals.',
        tag: 'Getting Started',
        urgent: false,
      });
    }

    return insights;
  }, [metrics]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1 } };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-8 animate-pulse">
          <div className="h-16 w-72 bg-white/5 rounded-3xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white/5 rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-white/5 rounded-3xl" />
            <div className="h-80 bg-white/5 rounded-3xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-8 border border-rose-500/20"
          >
            <AlertCircle size={48} className="text-rose-500" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">Sync Failure</h2>
          <p className="text-slate-400 font-medium max-w-md mb-10 leading-relaxed">{error}</p>
          <button
            onClick={fetchData}
            className="h-14 px-10 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black transition-all shadow-xl shadow-brand-500/20"
          >
            Retry Connection
          </button>
        </div>
      </AppLayout>
    );
  }

  // ── Main Dashboard ─────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="relative space-y-8 pb-8">
        {/* Ambient orbs */}
        <div className="orb-brand fixed top-[-10%] right-[-5%] w-[32rem] h-[32rem] opacity-20 pointer-events-none" />
        <div className="orb-accent fixed bottom-[5%] left-[-8%] w-[24rem] h-[24rem] opacity-10 pointer-events-none" />

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">AI Engine Active</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white italic">
              Capital <span className="text-brand-500" style={{ textShadow: '0 0 40px rgba(147,51,234,0.4)' }}>Intelligence</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">
              Your autonomous money operating system — {metrics.txCount} events logged
            </p>
          </div>

          {/* Balance pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card px-8 py-6 border-brand-500/20 min-w-[260px]"
          >
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[.3em] mb-3 flex items-center gap-2">
              <Shield size={10} className="text-brand-500" /> Net Position
            </p>
            <p className={`text-4xl font-black tracking-tighter ${metrics.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(metrics.balance)}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {metrics.balance >= 0
                ? <TrendingUp size={14} className="text-emerald-400" />
                : <TrendingDown size={14} className="text-rose-400" />
              }
              <span className={`text-xs font-bold ${metrics.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.balance >= 0 ? 'Positive' : 'Negative'} flow
              </span>
            </div>
          </motion.div>
        </motion.header>

        {/* ── KPI Row ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <MetricCard
            icon={TrendingUp}
            label="Monthly Income"
            value={formatCurrency(metrics.thisIncome)}
            sub="Total inflows this month"
            color="emerald"
            trend={metrics.incomeTrend}
          />
          <MetricCard
            icon={TrendingDown}
            label="Monthly Burn"
            value={formatCurrency(metrics.thisExpense)}
            sub="Total outflows this month"
            color="rose"
            trend={metrics.expenseTrend}
          />
          <MetricCard
            icon={Target}
            label="Daily Safe Limit"
            value={formatCurrency(metrics.safeToSpend)}
            sub="AI-calibrated per day"
            color="brand"
          />
          <MetricCard
            icon={Cpu}
            label="Top Expense"
            value={metrics.topCategory[0]}
            sub={metrics.topCategory[1] > 0 ? formatCurrency(metrics.topCategory[1]) + ' this month' : 'No data yet'}
            color="amber"
          />
        </motion.div>

        {/* ── Chart + AI Panel ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Chart */}
          <motion.div variants={item} className="lg:col-span-2">
            <div className="glass-card p-6 md:p-8 border-white/5 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <BarChart2 size={20} className="text-brand-400" />
                    Capital Flow
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Income vs. Expense visualization</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl">
                  {[['flow', '7 Days'], ['compare', '6 Months']].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveChart(key)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
                        activeChart === key 
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '256px', minHeight: '256px' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeChart}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%' }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {activeChart === 'flow' ? (
                        <AreaChart data={metrics.flowData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="income" name="Income" stroke="#34d399" strokeWidth={3} fill="url(#incGrad)" />
                          <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={3} fill="url(#expGrad)" />
                        </AreaChart>
                      ) : (
                        <BarChart data={metrics.compareData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            wrapperStyle={{ paddingTop: '16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                          />
                          <Bar dataKey="income" name="Income" fill="#34d399" fillOpacity={0.85} radius={[6, 6, 0, 0]} />
                          <Bar dataKey="expense" name="Expense" fill="#f43f5e" fillOpacity={0.85} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Projection banner */}
              {metrics.txCount > 0 && (
                <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-brand-400 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wide">Month-End Projection</p>
                      <p className="text-xs text-slate-500">
                        At current burn rate: {formatCurrency(metrics.projectedExpense)} total spend by end of month
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide ${
                    metrics.projectedExpense > metrics.thisIncome && metrics.thisIncome > 0
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {metrics.projectedExpense > metrics.thisIncome && metrics.thisIncome > 0 ? 'Over Budget' : 'On Track'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Guidance Panel */}
          <motion.div variants={item}>
            <div className="glass-card p-6 md:p-8 border-brand-500/10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Brain size={18} className="text-brand-400" />
                  AI Guidance
                </h3>
                <div className="flex items-center gap-2 px-2 py-1 bg-brand-500/10 rounded-full border border-brand-500/20">
                  <span className="w-1 h-1 bg-brand-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-brand-400 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {aiInsights.map((insight, i) => (
                  <AIInsightCard key={i} {...insight} />
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Clock size={12} />
                  <span>Updated just now · Powered by FlowAI Engine</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Recent Activity + Stats ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Transactions */}
          <motion.div variants={item}>
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Activity size={18} className="text-slate-400" /> Recent Activity
                </h3>
                <a href="/transactions" className="text-xs font-black text-brand-400 hover:text-brand-300 uppercase tracking-widest flex items-center gap-1">
                  All <ArrowUpRight size={12} />
                </a>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t._id} className="flex items-center gap-4 py-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{t.category}</p>
                      <p className="text-xs text-slate-500 truncate">{t.note || 'No description'}</p>
                    </div>
                    <p className={`text-sm font-black shrink-0 ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="py-16 flex flex-col items-center text-center text-slate-600">
                    <Layers size={40} className="opacity-20 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-30">No transactions yet</p>
                    <p className="text-xs text-slate-700 mt-1">Add your first entry from the Ledger page</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Financial Health Score */}
          <motion.div variants={item}>
            <div className="glass-card p-6 md:p-8 h-full">
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mb-6">
                <Sparkles size={18} className="text-brand-400" /> Financial Health
              </h3>

              <div className="space-y-5">
                {[
                  {
                    label: 'Savings Rate',
                    value: metrics.thisIncome > 0 
                      ? Math.max(0, Math.round(((metrics.thisIncome - metrics.thisExpense) / metrics.thisIncome) * 100)) 
                      : 0,
                    color: '#34d399',
                    target: 20,
                    unit: '%',
                  },
                  {
                    label: 'Budget Adherence',
                    value: metrics.thisIncome > 0
                      ? Math.min(100, Math.round((1 - metrics.thisExpense / metrics.thisIncome) * 100 + 50))
                      : 0,
                    color: '#a855f7',
                    target: 80,
                    unit: '%',
                  },
                  {
                    label: 'Burn Rate vs. Income',
                    value: metrics.thisIncome > 0
                      ? Math.round((metrics.thisExpense / metrics.thisIncome) * 100)
                      : 0,
                    color: '#f59e0b',
                    target: 70,
                    unit: '%',
                    invert: true,
                  },
                ].map((stat) => {
                  const capped = Math.min(100, Math.max(0, stat.value));
                  const isGood = stat.invert ? capped <= stat.target : capped >= stat.target;
                  return (
                    <div key={stat.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</span>
                        <span className="text-sm font-black text-white">{stat.value}{stat.unit}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${capped}%` }}
                          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                          style={{ backgroundColor: stat.color }}
                          className="h-full rounded-full"
                        />
                      </div>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isGood ? '✓ On target' : '⚠ Needs attention'}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-brand-500/5 border border-brand-500/20 rounded-2xl">
                <p className="text-xs font-black text-brand-400 uppercase tracking-widest mb-1">FlowAI Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white">
                    {metrics.txCount === 0 ? '--' : (
                      Math.min(100, Math.round(
                        (metrics.thisIncome > 0 ? 
                          Math.max(0, ((metrics.thisIncome - metrics.thisExpense) / metrics.thisIncome) * 100) 
                          : 0) * 0.7 + 30
                      ))
                    )}
                  </span>
                  {metrics.txCount > 0 && <span className="text-slate-600 font-bold text-lg mb-1">/100</span>}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {metrics.txCount === 0 ? 'Add transactions to compute your score' : 'Based on flow patterns, savings rate, and burn ratio'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </AppLayout>
  );
};

export default Dashboard;
