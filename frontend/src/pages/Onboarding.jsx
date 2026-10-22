import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Loader2,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import api from '../services/api';
import useSettings from '../context/useSettings';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/format';

const goals = [
  { id: 'control', icon: ShieldCheck, title: 'Feel in control', copy: 'Know what is safe before I spend.' },
  { id: 'save', icon: Target, title: 'Save for something', copy: 'Turn a goal into a monthly number.' },
  { id: 'subscriptions', icon: Repeat2, title: 'Cut subscriptions', copy: 'Find charges that keep repeating.' },
  { id: 'spending', icon: BarChart3, title: 'Understand spending', copy: 'See where the month actually goes.' },
];

const todayInput = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [income, setIncome] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayInput);
  const [expenseNote, setExpenseNote] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const dailySafe = useMemo(() => {
    if (!result) return 0;
    const incomeTotal = Number(result.monthIncome) || 0;
    const spent = Number(result.monthExpense) || 0;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
    return Math.max(0, (incomeTotal - spent) / daysLeft);
  }, [result]);

  if (settings.onboardingCompleted === true) {
    return <Navigate to="/" replace />;
  }

  const saveSettings = (responseProfile) => {
    setSettings((current) => ({
      ...current,
      ...(responseProfile || {}),
      onboardingCompleted: true,
    }));
  };

  const skip = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/onboarding/skip');
      saveSettings(data.profile);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Setup could not be skipped. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const finish = async (withExpense) => {
    setSaving(true);
    setError('');
    try {
      const payload = { goal, monthlyIncome: Number(income) };
      if (withExpense) {
        payload.firstExpense = {
          amount: Number(expenseAmount),
          category: expenseCategory.trim(),
          note: expenseNote.trim(),
          date: expenseDate,
        };
      }
      const { data } = await api.post('/onboarding', payload);
      // Keep the gate closed until the user leaves the result screen.
      setResult(data.summary || {});
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Your first read could not be created. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const openOverview = () => {
    setSettings((current) => ({
      ...current,
      onboardingCompleted: true,
      onboardingGoal: goal,
    }));
    navigate('/', { replace: true });
  };

  const continueToIncome = () => {
    setError('');
    if (!goal) {
      setError('Choose one thing to focus on first.');
      return;
    }
    setStep(1);
  };

  const continueToExpense = (event) => {
    event.preventDefault();
    setError('');
    if (!Number(income) || Number(income) <= 0) {
      setError('Enter the income that arrived this month.');
      return;
    }
    setStep(2);
  };

  const submitExpense = (event) => {
    event.preventDefault();
    setError('');
    if (!Number(expenseAmount) || Number(expenseAmount) <= 0 || !expenseCategory.trim()) {
      setError('Add an amount and a category for the purchase.');
      return;
    }
    finish(true);
  };

  return (
    <div className="auth-shell onboarding-shell">
      <section className="auth-story">
        <div>
          <div className="brand-lockup">
            <span className="brand-mark"><Activity size={18} /></span>
            <span>
              <span className="brand-name text-white">FlowAI</span>
              <span className="brand-note text-white/50">personal finance</span>
            </span>
          </div>
          <h1>One clear number. About a minute.</h1>
          <p>
            No bank login. No spreadsheet. Add two real entries and FlowAI shows
            what is safe to spend next.
          </p>
        </div>
        <div className="onboarding-story-list">
          {['Choose what matters', 'Add this month’s income', 'Add one purchase'].map((label, index) => (
            <span key={label} className={step > index ? 'onboarding-story-done' : ''}>
              <span>{step > index ? <Check size={13} /> : index + 1}</span>
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap onboarding-wrap">
          {step < 3 && (
            <div className="onboarding-progress" aria-label={`Step ${step + 1} of 3`}>
              {[0, 1, 2].map((index) => <span key={index} className={step >= index ? 'active' : ''} />)}
            </div>
          )}

          {step === 0 && (
            <>
              <p className="eyebrow">Step 1 of 3</p>
              <h2>What should FlowAI help with first?</h2>
              <p>Pick one. This shapes the first read, not a permanent setting.</p>
              <div className="onboarding-goals" role="group" aria-label="Choose a focus">
                {goals.map(({ id, icon: Icon, title, copy }) => (
                  <button
                    key={id}
                    type="button"
                    className={`onboarding-goal ${goal === id ? 'selected' : ''}`}
                    onClick={() => setGoal(id)}
                    aria-pressed={goal === id}
                  >
                    <Icon size={19} />
                    <strong>{title}</strong>
                    <span>{copy}</span>
                  </button>
                ))}
              </div>
              {error && <p className="error-message" role="alert">{error}</p>}
              <div className="onboarding-actions">
                <button type="button" className="button-quiet" onClick={skip} disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Skip setup'}
                </button>
                <Button type="button" onClick={continueToIncome}>
                  Continue <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="eyebrow">Step 2 of 3</p>
              <h2>What came in this month?</h2>
              <p>Use your take-home pay. You can add more income later.</p>
              <form className="onboarding-form" onSubmit={continueToExpense}>
                <div>
                  <label className="field-label" htmlFor="onboarding-income">Income this month</label>
                  <Input
                    id="onboarding-income"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={income}
                    onChange={(event) => setIncome(event.target.value)}
                    placeholder="4200"
                    icon={<span>$</span>}
                    autoFocus
                  />
                </div>
                <div className="onboarding-tip">
                  <Sparkles size={16} />
                  <p>This becomes the base for your daily safe-to-spend number.</p>
                </div>
                {error && <p className="error-message" role="alert">{error}</p>}
                <div className="onboarding-actions">
                  <button type="button" className="button-quiet" onClick={() => setStep(0)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <Button type="submit">Continue <ArrowRight size={16} /></Button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <p className="eyebrow">Step 3 of 3</p>
              <h2>Add one recent purchase.</h2>
              <p>This gives the first read something real to work with.</p>
              <form className="onboarding-form" onSubmit={submitExpense}>
                <div className="onboarding-form-grid">
                  <div>
                    <label className="field-label" htmlFor="onboarding-expense">Amount</label>
                    <Input
                      id="onboarding-expense"
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      value={expenseAmount}
                      onChange={(event) => setExpenseAmount(event.target.value)}
                      placeholder="18.40"
                      icon={<span>$</span>}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="onboarding-category">Category</label>
                    <Input
                      id="onboarding-category"
                      value={expenseCategory}
                      onChange={(event) => setExpenseCategory(event.target.value)}
                      placeholder="Food"
                    />
                  </div>
                </div>
                <div className="onboarding-form-grid">
                  <div>
                    <label className="field-label" htmlFor="onboarding-date">Date</label>
                    <Input id="onboarding-date" type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="onboarding-note">Note</label>
                    <Input id="onboarding-note" value={expenseNote} onChange={(event) => setExpenseNote(event.target.value)} placeholder="Lunch" />
                  </div>
                </div>
                {error && <p className="error-message" role="alert">{error}</p>}
                <div className="onboarding-actions">
                  <button type="button" className="button-quiet" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <div className="onboarding-action-group">
                    <button type="button" className="button-quiet" onClick={() => finish(false)} disabled={saving}>
                      Skip expense
                    </button>
                    <Button type="submit" disabled={saving}>
                      {saving ? <Loader2 size={16} className="animate-spin" /> : 'Create my first read'}
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="onboarding-result">
              <span className="onboarding-result-icon"><Check size={22} /></span>
              <p className="eyebrow">Setup complete</p>
              <h2>You can spend about {formatCurrency(dailySafe)} a day.</h2>
              <p>
                Based on {formatCurrency(Number(result?.monthIncome) || 0)} in and{' '}
                {formatCurrency(Number(result?.monthExpense) || 0)} out this month.
              </p>
              <div className="onboarding-result-grid">
                <div><span>Money in</span><strong>{formatCurrency(Number(result?.monthIncome) || 0)}</strong></div>
                <div><span>Money out</span><strong>{formatCurrency(Number(result?.monthExpense) || 0)}</strong></div>
                <div><span>Top category</span><strong>{result?.topCategory?.name || 'Not enough data'}</strong></div>
              </div>
              <Button type="button" className="w-full" onClick={openOverview}>
                Open my overview <ArrowRight size={16} />
              </Button>
              <p className="onboarding-footnote">Your entries stay private to your account.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Onboarding;
