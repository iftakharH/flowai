import React, { useEffect, useState } from 'react';
import { BarChart3, Download, FileText } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import ProGate from '../components/ProGate';
import api from '../services/api';
import { formatCurrency } from '../utils/format';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/reports/monthly?month=${month}`).then(({ data }) => { setReport(data); setError(''); }).catch((err) => setError(err.response?.data?.message || 'Report unavailable'));
  }, [month]);

  return <AppLayout><div className="space-y-7 pb-4"><header className="page-header mb-3"><div><p className="eyebrow">A monthly read</p><h1 className="page-title">Reports that tell a story.</h1><p className="page-subtitle">See where the month went and what changed from the inside out.</p></div><FileText className="text-[var(--sage-dark)]" size={24} /></header><ProGate title="Monthly reports are a Pro feature" copy="Turn your ledger into a clean monthly review you can save or share.">{error ? <div className="empty-state panel p-8"><p>{error}</p></div> : <div className="grid gap-5"><section className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="section-note">Choose a month</p><input className="field-control mt-2" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></div><button type="button" className="button-secondary"><Download size={16} /> Print / save</button></section>{report && <><section className="report-totals">{report.totals.map((item) => <div className="metric-card" key={item._id}><span className="metric-label">{item._id === 'income' ? 'Income' : 'Spent'}</span><strong className="metric-value">{formatCurrency(item.total)}</strong><span className="metric-detail">{item.count} entries</span></div>)}</section><section className="panel p-5 md:p-7"><div className="section-heading"><div><p className="section-note">Where it went</p><h2 className="section-title">Spending by category</h2></div><BarChart3 size={19} className="text-[var(--sage-dark)]" /></div><div className="report-categories">{report.categories.map((item) => <div key={item._id}><div className="flex justify-between gap-3"><span>{item._id}</span><strong>{formatCurrency(item.total)}</strong></div><div className="health-track"><span style={{ width: `${Math.min(100, (item.total / (report.categories[0]?.total || 1)) * 100)}%` }} /></div></div>)}</div></section></>}</div>}</ProGate></div></AppLayout>;
};

export default Reports;
