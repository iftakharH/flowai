import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, FileDown, Filter, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import CSVModal from '../components/CSVModal';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/format';
import { Skeleton } from '../components/ui/Skeleton';

const PAGE_SIZE = 50;

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const buildParams = (pageNumber) => {
    const params = { limit: PAGE_SIZE, page: pageNumber };
    if (filterType !== 'all') params.type = filterType;
    if (filterCategory.trim()) params.category = filterCategory.trim();
    if (filterStartDate) params.startDate = filterStartDate;
    if (filterEndDate) params.endDate = `${filterEndDate}T23:59:59`;
    return params;
  };

  const fetchTransactions = async (reset = true) => {
    const pageNumber = reset ? 1 : page + 1;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await api.get('/transactions', { params: buildParams(pageNumber) });
      setTransactions((current) => reset ? data.transactions || [] : [...current, ...(data.transactions || [])]);
      setTotal(data.total || 0);
      setPage(pageNumber);
    } catch {
      toast.error('Your ledger could not be loaded');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTransactions(true);
    // The initial fetch should not re-run when filter state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setAmount('');
    setType('expense');
    setCategory('');
    setDate('');
    setNote('');
    setIsModalOpen(true);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(toDateInput(transaction.date));
    setNote(transaction.note || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { amount: Number(amount), type, category, note };
      if (date) payload.date = date;
      if (editing) {
        await api.put(`/transactions/${editing._id}`, payload);
        toast.success('Entry updated');
      } else {
        await api.post('/transactions', payload);
        toast.success('Entry added');
      }
      closeModal();
      await fetchTransactions(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'The entry could not be saved');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Entry removed');
      await fetchTransactions(true);
    } catch {
      toast.error('The entry could not be removed');
    }
  };

  const filteredTransactions = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return transactions;
    return transactions.filter((transaction) => (
      transaction.category.toLowerCase().includes(query)
      || transaction.note?.toLowerCase().includes(query)
    ));
  }, [search, transactions]);

  const hasFilters = filterType !== 'all' || filterCategory || filterStartDate || filterEndDate;

  return (
    <AppLayout>
      <div className="space-y-6 pb-4">
        <header className="page-header mb-3">
          <div>
            <p className="eyebrow">Your money, in plain view</p>
            <h1 className="page-title">Transactions.</h1>
            <p className="page-subtitle">Add, review, and correct the entries behind your monthly picture.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="secondary" onClick={() => setIsCsvModalOpen(true)}><FileDown size={16} /> Import CSV</Button>
            <Button onClick={openCreate}><Plus size={17} /> New entry</Button>
          </div>
        </header>

        <section className="panel p-4 md:p-5">
          <div className="ledger-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input className="field-control pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search category or note" aria-label="Search ledger" />
            </div>
            <Button variant={filterOpen || hasFilters ? 'primary' : 'secondary'} onClick={() => setFilterOpen((value) => !value)}><Filter size={16} /> Filter{hasFilters ? ' active' : ''}</Button>
          </div>

          {filterOpen && (
            <div className="filter-panel">
              <div>
                <span className="field-label">Type</span>
                <div className="segmented-control">
                  {['all', 'income', 'expense'].map((value) => <button key={value} type="button" className={filterType === value ? 'segmented-active' : ''} onClick={() => setFilterType(value)}>{value === 'all' ? 'All' : value}</button>)}
                </div>
              </div>
              <div><label className="field-label" htmlFor="filter-category">Category</label><Input id="filter-category" value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} placeholder="Category" /></div>
              <div><label className="field-label" htmlFor="filter-start">From</label><Input id="filter-start" type="date" value={filterStartDate} onChange={(event) => setFilterStartDate(event.target.value)} /></div>
              <div><label className="field-label" htmlFor="filter-end">To</label><Input id="filter-end" type="date" value={filterEndDate} onChange={(event) => setFilterEndDate(event.target.value)} /></div>
              <div className="filter-actions">
                <Button onClick={() => { setFilterOpen(false); fetchTransactions(true); }}>Apply filters</Button>
                <Button variant="ghost" onClick={() => { setFilterType('all'); setFilterCategory(''); setFilterStartDate(''); setFilterEndDate(''); fetchTransactions(true); }}>Reset</Button>
              </div>
            </div>
          )}
        </section>

        <section className="ledger-list" aria-live="polite">
          {loading ? [1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-24 w-full rounded-xl bg-[#e7ebe4]" />) : null}
          {!loading && !filteredTransactions.length && (
            <div className="empty-state panel p-8">
              <div><Activity size={28} className="mx-auto mb-3" /><p className="m-0 text-sm">No entries match this view.</p><p className="mt-2 text-xs text-[var(--muted)]">Try clearing a filter or add your first transaction.</p></div>
            </div>
          )}
          {!loading && filteredTransactions.map((transaction) => (
            <article key={transaction._id} className="transaction-row">
              <div className={`transaction-type ${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}`}>
                {transaction.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
              <div className="transaction-date"><strong>{format(new Date(transaction.date), 'dd')}</strong><span>{format(new Date(transaction.date), 'MMM yy')}</span></div>
              <div className="transaction-copy"><h2>{transaction.category}</h2><p>{transaction.note || 'No note added'}</p></div>
              <div className={`transaction-amount ${transaction.type === 'income' ? 'status-positive' : 'status-negative'}`}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</div>
              <div className="transaction-actions">
                <button type="button" className="icon-button" onClick={() => openEdit(transaction)} title="Edit entry" aria-label="Edit entry"><Pencil size={16} /></button>
                <button type="button" className="icon-button" onClick={() => handleDelete(transaction._id)} title="Delete entry" aria-label="Delete entry"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
          {!loading && transactions.length < total && (
            <div className="flex justify-center pt-2"><Button variant="secondary" onClick={() => fetchTransactions(false)} disabled={loadingMore}>{loadingMore && <Loader2 size={16} className="animate-spin" />}Load more <span className="text-[var(--muted)]">({transactions.length}/{total})</span></Button></div>
          )}
        </section>
      </div>

      <CSVModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} onSuccess={() => fetchTransactions(true)} />

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="entry-dialog-title">
            <div className="modal-header"><div><p className="section-note">Ledger entry</p><h2 id="entry-dialog-title">{editing ? 'Edit entry' : 'Add an entry'}</h2></div><button type="button" className="icon-button" onClick={closeModal} aria-label="Close dialog"><X size={19} /></button></div>
            <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:p-6">
              <div className="segmented-control"><button type="button" className={type === 'expense' ? 'segmented-active' : ''} onClick={() => setType('expense')}>Expense</button><button type="button" className={type === 'income' ? 'segmented-active' : ''} onClick={() => setType('income')}>Income</button></div>
              <div className="modal-form-grid"><div><label className="field-label" htmlFor="entry-amount">Amount</label><Input id="entry-amount" type="number" required min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" icon={<span>$</span>} /></div><div><label className="field-label" htmlFor="entry-category">Category</label><Input id="entry-category" required value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Rent, groceries..." /></div></div>
              <div><label className="field-label" htmlFor="entry-date">Date</label><Input id="entry-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div>
              <div><label className="field-label" htmlFor="entry-note">Note</label><Input id="entry-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" /></div>
              <Button type="submit" disabled={saving} className="mt-2 w-full">{saving ? <Loader2 size={17} className="animate-spin" /> : editing ? 'Save changes' : 'Add entry'}</Button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Transactions;
