import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Search, FileDown, Activity, Calendar, Tag, Info, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import CSVModal from '../components/CSVModal';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data.transactions || []);
    } catch {
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', { amount: Number(amount), type, category, note });
      toast.success('Transaction logged');
      setIsModalOpen(false);
      setAmount(''); setCategory(''); setNote('');
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logging failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Removed from ledger');
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch {
      toast.error('Deletion error');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.category.toLowerCase().includes(search.toLowerCase()) || 
      (t.note && t.note.toLowerCase().includes(search.toLowerCase()))
    );
  }, [transactions, search]);

  return (
    <AppLayout>
      <div className="relative space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
           <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2"
              >
                Capital <span className="text-brand-500 text-glow">Ledger</span>
              </motion.h1>
              <p className="text-slate-400 font-medium">Verify and audit your incoming and outgoing flows.</p>
           </div>
           
           <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setIsCsvModalOpen(true)}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 px-8 h-14 rounded-2xl"
              >
                 <FileDown size={20} className="mr-2" /> Import
              </Button>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-500 hover:bg-brand-400 text-white px-8 h-14 rounded-2xl shadow-xl shadow-brand-500/20"
              >
                 <Plus size={20} className="mr-2" /> New Entry
              </Button>
           </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
              <input 
                type="text" 
                placeholder="Search category, note, or amount..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/5 text-white h-16 rounded-3xl pl-16 pr-8 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all placeholder:text-slate-600"
              />
           </div>
           <Button variant="secondary" className="h-16 px-8 rounded-3xl bg-white/5 border-white/5 text-slate-400 hover:text-white">
              <Filter size={20} className="mr-2" /> Filter
           </Button>
        </div>

        {/* Table/List View */}
        <div className="space-y-4">
          {loading ? (
            [1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-3xl" />)
          ) : filteredTransactions.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-slate-600">
               <Activity size={80} className="opacity-10 mb-6" />
               <p className="text-xl font-black uppercase tracking-widest opacity-20">No data detected</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTransactions.map((t, idx) => (
                <motion.div 
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative"
                >
                   <div className="glass-card glass-card-hover p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                      {/* Date Block */}
                      <div className="flex md:flex-col items-center gap-2 min-w-[100px] text-center">
                         <span className="text-3xl font-black text-white">{format(new Date(t.date), 'dd')}</span>
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{format(new Date(t.date), 'MMM yy')}</span>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                         <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-brand-500/10 text-brand-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {t.type === 'income' ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
                         </div>
                         <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-white mb-0.5">{t.category}</h3>
                            <p className="text-slate-500 font-medium text-sm">{t.note || 'No description provided'}</p>
                         </div>
                      </div>

                      {/* Tags (Desktop) */}
                      <div className="hidden lg:flex items-center gap-4">
                         <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Tag size={14} className="text-brand-500" /> CATEGORY
                         </div>
                      </div>

                      {/* Amount Section */}
                      <div className="flex items-center gap-8 ml-auto pr-4">
                         <div className="text-right">
                            <p className={`text-2xl font-black ${t.type === 'income' ? 'text-brand-400' : 'text-white'}`}>
                               {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                            </p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-right">USD CURRENCY</p>
                         </div>
                         <button 
                           onClick={() => handleDelete(t._id)}
                           className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                         >
                            <Trash2 size={20} />
                         </button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <CSVModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} onSuccess={fetchTransactions} />

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-3xl p-6">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="glass-card w-full max-w-xl p-10 space-y-8"
             >
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black text-white tracking-tighter">Add <span className="text-brand-500">Capital</span></h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl text-slate-400 transition-colors"><X size={24} /></button>
                 </div>
                 
                 <form onSubmit={handleCreate} className="space-y-8">
                    <div className="flex gap-2 p-2 bg-white/5 rounded-3xl">
                       <button type="button" onClick={() => setType('expense')} className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all ${type === 'expense' ? 'bg-white text-slate-950' : 'text-slate-500'}`}>EXPENSE</button>
                       <button type="button" onClick={() => setType('income')} className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all ${type === 'income' ? 'bg-white text-slate-950' : 'text-slate-500'}`}>INCOME</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Amount (USD)</label>
                          <Input type="number" required min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="bg-white/5 border-white/10 h-16 rounded-2xl text-xl font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Classification</label>
                          <Input type="text" required value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Health, Cloud, Rent" className="bg-white/5 border-white/10 h-16 rounded-2xl text-xl font-bold" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Execution Note</label>
                       <Input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Brief description of event" className="bg-white/5 border-white/10 h-16 rounded-2xl text-xl font-bold" />
                    </div>

                    <Button type="submit" className="w-full h-18 text-xl bg-brand-500 hover:bg-brand-400 text-white font-black rounded-3xl shadow-2xl shadow-brand-500/20">
                       EXECUTE TRANSACTION
                    </Button>
                 </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Transactions;
