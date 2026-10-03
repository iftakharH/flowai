import React, { useEffect, useState } from 'react';
import { BarChart3, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('FlowAI');
  const [error, setError] = useState('');

  const fetchData = () => Promise.all([
    api.get('/admin/stats'),
    api.get('/admin/users?limit=20'),
    api.get('/quotes'),
  ]);

  const applyData = ([statsRes, usersRes, quotesRes]) => {
      setStats(statsRes.data);
      setUsers(usersRes.data.items || []);
      setQuotes(quotesRes.data || []);
      setError('');
  };

  const load = async () => {
    try { applyData(await fetchData()); } catch (err) { setError(err.response?.data?.message || 'Admin access is unavailable for this account.'); }
  };

  useEffect(() => {
    let active = true;
    fetchData().then((data) => { if (active) applyData(data); }).catch((err) => { if (active) setError(err.response?.data?.message || 'Admin access is unavailable for this account.'); });
    return () => { active = false; };
  }, []);

  const updateUser = async (user, updates) => {
    try { await api.patch(`/admin/users/${user._id}`, updates); toast.success('User updated'); load(); } catch (err) { toast.error(err.response?.data?.message || 'User could not be updated'); }
  };

  const createQuote = async (event) => {
    event.preventDefault();
    if (!quoteText.trim()) return;
    try { await api.post('/quotes', { text: quoteText.trim(), author: quoteAuthor.trim() || 'FlowAI' }); setQuoteText(''); toast.success('Quote added'); load(); } catch (err) { toast.error(err.response?.data?.message || 'Quote could not be added'); }
  };

  const removeQuote = async (quote) => {
    if (!quote._id) return toast('Built-in quote. Add a saved quote to manage it.');
    try { await api.delete(`/quotes/${quote._id}`); toast.success('Quote removed'); load(); } catch (err) { toast.error(err.response?.data?.message || 'Quote could not be removed'); }
  };

  return <AppLayout><div className="space-y-7 pb-4"><header className="page-header mb-3"><div><p className="eyebrow">Private control room</p><h1 className="page-title">Admin workspace.</h1><p className="page-subtitle">Manage users, Pro access, and the words that greet people on the overview.</p></div><ShieldCheck className="text-[var(--sage-dark)]" size={26} /></header>{error ? <div className="empty-state panel p-8"><div><ShieldCheck className="mx-auto mb-4 text-[#a6573c]" size={30} /><p>{error}</p></div></div> : <><section className="admin-stat-grid">{[['Users', stats?.users || 0], ['Pro users', stats?.proUsers || 0], ['Entries', stats?.transactions || 0], ['Est. monthly revenue', `$${stats?.estimatedMonthlyRevenue || 0}`]].map(([label, value]) => <div className="panel admin-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section><section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Customer access</p><h2 className="section-title">Users and plans</h2></div><UserPlus size={19} className="text-[var(--sage-dark)]" /></div><div className="admin-table">{users.map((user) => <div className="admin-user-row" key={user._id}><div><strong>{user.displayName || 'Unnamed user'}</strong><span>{user.email || user.firebaseUid}</span></div><span className={`plan-badge ${user.plan === 'pro' ? 'plan-pro' : ''}`}>{user.plan}</span><div className="flex gap-2"><Button size="sm" variant={user.plan === 'pro' ? 'secondary' : 'primary'} onClick={() => updateUser(user, { plan: user.plan === 'pro' ? 'free' : 'pro' })}>{user.plan === 'pro' ? 'Remove Pro' : 'Make Pro'}</Button><Button size="sm" variant="ghost" onClick={() => updateUser(user, { isAdmin: !user.isAdmin })}>{user.isAdmin ? 'Remove admin' : 'Make admin'}</Button></div></div>)}</div></section><section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Overview content</p><h2 className="section-title">Motivation quotes</h2></div><BarChart3 size={19} className="text-[var(--sage-dark)]" /></div><form onSubmit={createQuote} className="admin-quote-form"><Input value={quoteText} onChange={(event) => setQuoteText(event.target.value)} placeholder="A useful sentence about money" /><Input value={quoteAuthor} onChange={(event) => setQuoteAuthor(event.target.value)} placeholder="Author" /><Button type="submit">Add quote</Button></form><div className="quote-admin-list">{quotes.map((quote, index) => <div className="quote-admin-row" key={quote._id || `${quote.text}-${index}`}><span>“{quote.text}” <small>- {quote.author}</small></span><button type="button" className="icon-button" onClick={() => removeQuote(quote)} aria-label="Remove quote"><Trash2 size={15} /></button></div>)}</div></section></>}</div></AppLayout>;
};

export default Admin;
