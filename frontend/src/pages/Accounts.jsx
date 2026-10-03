import React, { useEffect, useState } from 'react';
import { CreditCard, Plus, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import ProGate from '../components/ProGate';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/format';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [openingBalance, setOpeningBalance] = useState('');
  const load = () => api.get('/accounts').then(({ data }) => setAccounts(data)).catch(() => undefined);
  useEffect(() => {
    let active = true;
    api.get('/accounts').then(({ data }) => { if (active) setAccounts(data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const create = async (event) => { event.preventDefault(); try { await api.post('/accounts', { name, type, openingBalance: Number(openingBalance) || 0 }); setName(''); setOpeningBalance(''); toast.success('Account added'); load(); } catch (error) { toast.error(error.response?.data?.message || 'Account could not be added'); } };
  return <AppLayout><div className="space-y-7 pb-4"><header className="page-header mb-3"><div><p className="eyebrow">Cards and cash, together</p><h1 className="page-title">Your accounts.</h1><p className="page-subtitle">Keep balances and spending sources in one clear place.</p></div><CreditCard className="text-[var(--sage-dark)]" size={24} /></header><ProGate title="Accounts are a Pro feature" copy="Track cards, cash accounts, and the balance behind your full financial picture."><div className="goals-layout"><section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Add one</p><h2 className="section-title">New account</h2></div><Plus size={19} className="text-[var(--sage-dark)]" /></div><form onSubmit={create} className="grid gap-4"><div><label className="field-label" htmlFor="account-name">Name</label><Input id="account-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Everyday card" /></div><div><span className="field-label">Type</span><div className="segmented-control"><button type="button" className={type === 'cash' ? 'segmented-active' : ''} onClick={() => setType('cash')}>Cash</button><button type="button" className={type === 'card' ? 'segmented-active' : ''} onClick={() => setType('card')}>Card</button></div></div><div><label className="field-label" htmlFor="account-opening">Starting balance</label><Input id="account-opening" type="number" step="0.01" value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value)} placeholder="0.00" /></div><Button type="submit">Add account</Button></form></section><section className="grid gap-3">{accounts.length ? accounts.map((account) => <article className="panel account-card" key={account._id}><span className="account-type-icon">{account.type === 'card' ? <CreditCard size={18} /> : <Wallet size={18} />}</span><div><p className="goal-name">{account.name}</p><p className="goal-meta">{account.type === 'card' ? 'Card' : 'Cash account'}{account.last4 ? ` ending ${account.last4}` : ''}</p></div><strong>{formatCurrency(account.balance)}</strong></article>) : <div className="empty-state panel p-8"><p>Add an account to start your net-worth view.</p></div>}</section></div></ProGate></div></AppLayout>;
};

export default Accounts;
