import React, { useEffect, useState } from 'react';
import { CalendarClock, Plus, Target, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import ProGate from '../components/ProGate';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/format';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const load = () => api.get('/goals').then(({ data }) => setGoals(data)).catch(() => undefined);
  useEffect(() => {
    let active = true;
    api.get('/goals').then(({ data }) => { if (active) setGoals(data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const create = async (event) => { event.preventDefault(); try { await api.post('/goals', { name, targetAmount: Number(targetAmount), savedAmount: 0, deadline }); setName(''); setTargetAmount(''); setDeadline(''); toast.success('Goal created'); load(); } catch (error) { toast.error(error.response?.data?.message || 'Goal could not be created'); } };
  const remove = async (id) => { await api.delete(`/goals/${id}`); toast.success('Goal removed'); load(); };
  return <AppLayout><div className="space-y-7 pb-4"><header className="page-header mb-3"><div><p className="eyebrow">A future worth making room for</p><h1 className="page-title">Savings goals.</h1><p className="page-subtitle">Give a number a name, a date, and a path forward.</p></div><Target className="text-[var(--sage-dark)]" size={24} /></header><ProGate title="Goals are a Pro feature" copy="Use targets and deadlines to make surplus money feel tangible."><div className="goals-layout"><section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Start one</p><h2 className="section-title">New goal</h2></div><Plus size={19} className="text-[var(--sage-dark)]" /></div><form onSubmit={create} className="grid gap-4"><div><label className="field-label" htmlFor="goal-name">Goal name</label><Input id="goal-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Emergency fund" /></div><div><label className="field-label" htmlFor="goal-target">Target amount</label><Input id="goal-target" required type="number" min="1" step="0.01" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} placeholder="5000" /></div><div><label className="field-label" htmlFor="goal-deadline">Deadline</label><Input id="goal-deadline" required type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></div><Button type="submit">Create goal</Button></form></section><section className="grid gap-3">{goals.length ? goals.map((goal) => { const percent = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100); return <article className="panel goal-card" key={goal._id}><div className="flex items-start justify-between gap-3"><div><p className="goal-name">{goal.name}</p><p className="goal-meta"><CalendarClock size={13} /> due {new Date(goal.deadline).toLocaleDateString()}</p></div><button type="button" className="icon-button" onClick={() => remove(goal._id)} aria-label="Delete goal"><Trash2 size={16} /></button></div><div className="flex items-end justify-between gap-3"><strong>{formatCurrency(goal.savedAmount)}</strong><span>of {formatCurrency(goal.targetAmount)}</span></div><div className="budget-meter"><span className="budget-meter-safe" style={{ width: `${percent}%` }} /></div></article>; }) : <div className="empty-state panel p-8"><p>Set a goal to give your surplus somewhere useful to go.</p></div>}</section></div></ProGate></div></AppLayout>;
};

export default Goals;
