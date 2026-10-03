import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Layers, PiggyBank, Plus, ShieldCheck, Target, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/format';

const BudgetRow = ({ budget, onDelete }) => {
  const percent = Math.min(100, Math.max(0, budget.percentUsed || 0));
  const status = budget.overBudget ? 'over' : percent >= 80 ? 'warn' : 'safe';

  return (
    <div className="budget-row">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`budget-icon budget-icon-${status}`}>
          {budget.type === 'overall' ? <PiggyBank size={17} /> : <Layers size={17} />}
        </span>
        <div className="min-w-0">
          <p className="budget-name">{budget.type === 'overall' ? 'Overall monthly limit' : budget.category}</p>
          <p className="budget-meta">{formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}</p>
        </div>
      </div>
      <button type="button" onClick={() => onDelete(budget)} className="icon-button" title="Remove budget" aria-label="Remove budget">
        <Trash2 size={16} />
      </button>
      <div className="budget-meter"><span className={`budget-meter-${status}`} style={{ width: `${percent}%` }} /></div>
      <div className="flex items-center justify-between gap-3">
        <span className="budget-meta">{percent.toFixed(0)}% used</span>
        <span className={`budget-remaining budget-remaining-${status}`}>
          {budget.overBudget ? `${formatCurrency(Math.abs(budget.remaining))} over` : `${formatCurrency(budget.remaining)} left`}
        </span>
      </div>
    </div>
  );
};

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState('overall');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/insights/budget-status');
      setBudgets(data?.budgets || []);
    } catch (err) {
      console.error('FlowAI: failed to load budgets', err);
      setError(err.response?.data?.message || 'Your budgets could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) return toast.error('Enter an amount greater than zero');
    if (type === 'category' && !category.trim()) return toast.error('Add a category for this limit');

    setSaving(true);
    try {
      await api.post('/budgets', {
        amount: parsedAmount,
        type,
        ...(type === 'category' ? { category: category.trim() } : {}),
      });
      toast.success('Budget saved');
      setAmount('');
      setCategory('');
      await fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Budget could not be saved');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budget) => {
    try {
      await api.delete(`/budgets/${budget._id}`);
      toast.success('Budget removed');
      await fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Budget could not be removed');
    }
  };

  const overall = useMemo(() => budgets.find((item) => item.type === 'overall'), [budgets]);
  const categories = useMemo(() => budgets.filter((item) => item.type === 'category'), [budgets]);

  return (
    <AppLayout>
      <div className="space-y-7 pb-4">
        <header className="page-header">
          <div>
            <p className="eyebrow">Your monthly plan</p>
            <h1 className="page-title">Budgets that feel doable.</h1>
            <p className="page-subtitle">Set one overall limit or make room for the categories that matter most.</p>
          </div>
          <div className="panel flex items-center gap-3 px-4 py-3 text-sm text-[var(--muted)]">
            <Target size={17} className="text-[var(--sage-dark)]" />
            <span>{budgets.length} active {budgets.length === 1 ? 'limit' : 'limits'}</span>
          </div>
        </header>

        {loading && <div className="strategy-layout"><div className="h-96 animate-pulse rounded-2xl bg-[#e7ebe4]" /><div className="h-96 animate-pulse rounded-2xl bg-[#e7ebe4]" /></div>}

        {!loading && error && (
          <div className="empty-state panel p-8">
            <div>
              <AlertCircle className="mx-auto mb-4 text-[#a6573c]" size={28} />
              <h2 className="m-0 text-2xl font-semibold tracking-tight">Budgets are unavailable</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">{error}</p>
              <button type="button" onClick={fetchBudgets} className="button-primary mt-5">Try again</button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="strategy-layout">
            <section className="panel p-5 md:p-7">
              <div className="section-heading">
                <div>
                  <p className="section-note">Set a limit</p>
                  <h2 className="section-title">New budget</h2>
                </div>
                <Plus size={19} className="text-[var(--sage-dark)]" />
              </div>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div>
                  <span className="field-label">Budget type</span>
                  <div className="segmented-control">
                    <button type="button" className={type === 'overall' ? 'segmented-active' : ''} onClick={() => setType('overall')}>Overall</button>
                    <button type="button" className={type === 'category' ? 'segmented-active' : ''} onClick={() => setType('category')}>Category</button>
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="budget-amount">Monthly amount</label>
                  <Input id="budget-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" icon={<span>$</span>} />
                </div>
                {type === 'category' && (
                  <div>
                    <label className="field-label" htmlFor="budget-category">Category</label>
                    <Input id="budget-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Groceries, travel, rent..." />
                  </div>
                )}
                <Button type="submit" disabled={saving} className="mt-2 w-full">
                  {saving ? 'Saving...' : 'Save budget'}
                </Button>
              </form>
              <div className="helper-note">
                <ShieldCheck size={16} />
                <span>Limits compare against this month&apos;s spending and reset with the calendar.</span>
              </div>
            </section>

            <section className="panel p-5 md:p-7">
              <div className="section-heading">
                <div>
                  <p className="section-note">Month to date</p>
                  <h2 className="section-title">Active limits</h2>
                </div>
                <Wallet size={19} className="text-[var(--sage-dark)]" />
              </div>

              {!budgets.length ? (
                <div className="empty-state"><div><Wallet size={28} className="mx-auto mb-3" /><p className="m-0 text-sm">Set your first limit to see it here.</p></div></div>
              ) : (
                <div className="grid gap-3">
                  {overall && <BudgetRow budget={overall} onDelete={handleDelete} />}
                  {categories.length > 0 && <p className="budget-group-label">Category limits</p>}
                  {categories.map((budget) => <BudgetRow key={budget._id} budget={budget} onDelete={handleDelete} />)}
                </div>
              )}

              {overall && (
                <div className="budget-summary">
                  <div>
                    <p className="section-note">Overall spend</p>
                    <strong>{formatCurrency(overall.spent)}</strong>
                  </div>
                  <span className={overall.overBudget ? 'budget-summary-over' : 'budget-summary-safe'}>
                    {overall.overBudget ? 'Over limit' : 'On track'}
                  </span>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Budget;
