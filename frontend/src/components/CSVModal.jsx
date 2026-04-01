import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UploadCloud, CheckCircle2, ChevronRight, X, Loader2, FileSpreadsheet, Layers, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

const CSVModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({
    amount: '',
    type: '',
    category: '',
    date: '',
    note: ''
  });

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Selection required');

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const { data } = await api.post('/transactions/csv/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setColumns(data.columns);
      setPreviewData(data.fullData);
      setStep(2);
      toast.success('Matrix analyzed');
    } catch {
      toast.error('Data corruption detected or invalid CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!mapping.amount || !mapping.category) {
      return toast.error('Mapping incomplete: Amount and Category required');
    }

    const mappedData = previewData.map(row => {
      let typeVal = mapping.type && row[mapping.type] ? row[mapping.type].toLowerCase() : 'expense';
      if (!['income', 'expense'].includes(typeVal)) typeVal = 'expense';

      return {
        amount: Math.abs(parseFloat(row[mapping.amount])) || 0,
        type: typeVal,
        category: row[mapping.category] || 'Unmapped',
        date: mapping.date && row[mapping.date] ? new Date(row[mapping.date]) : new Date(),
        note: mapping.note && row[mapping.note] ? row[mapping.note] : ''
      };
    }).filter(row => row.amount > 0);

    setLoading(true);
    try {
      const { data } = await api.post('/transactions/csv/import', { mappedData });
      toast.success(`Imported ${data.count} entries to ledger`);
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 500);
    } catch {
      toast.error('Import synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1); setFile(null); setPreviewData([]); setColumns([]);
    setMapping({ amount: '', type: '', category: '', date: '', note: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-6 overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="glass-card w-full max-w-2xl overflow-hidden my-auto"
        >
          {/* Progress Header */}
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/[0.02] gap-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-brand-500/20 rounded-2xl text-brand-500">
                  <FileSpreadsheet size={24} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter">Bulk <span className="text-brand-500">Injection</span></h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className={`h-1.5 w-8 rounded-full transition-all ${step === 1 ? 'bg-brand-500' : 'bg-brand-500/30'}`} />
                     <span className={`h-1.5 w-8 rounded-full transition-all ${step === 2 ? 'bg-brand-500' : 'bg-white/10'}`} />
                  </div>
               </div>
            </div>
            <button onClick={handleClose} className="p-3 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="p-10">
            {step === 1 && (
              <form onSubmit={handleFileUpload} className="space-y-8">
                <div className="relative group">
                  <input 
                    type="file" accept=".csv" 
                    onChange={e => setFile(e.target.files[0])} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center group-hover:border-brand-500/50 group-hover:bg-white/[0.02] transition-all duration-500">
                    <div className="p-6 bg-white/5 rounded-full group-hover:scale-110 group-hover:text-brand-500 transition-all mb-6 text-slate-600">
                      <UploadCloud size={48} />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">
                      {file ? file.name : 'Select Data Matrix'}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">Standard CSV formats supported (UTF-8)</p>
                  </div>
                </div>
                
                <Button 
                   type="submit" 
                   disabled={!file || loading} 
                   className="w-full h-16 rounded-3xl bg-brand-500 hover:bg-brand-400 text-white font-black text-lg shadow-2xl shadow-brand-500/10 flex items-center justify-center gap-3"
                >
                   {loading ? <Loader2 className="animate-spin" size={24}/> : <>PROCEED TO MAPPING <ArrowRight size={20} /></>}
                </Button>
              </form>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="p-6 bg-brand-500/5 border border-brand-500/20 rounded-3xl flex items-start gap-4">
                  <CheckCircle2 className="text-brand-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Detected <span className="text-white font-black">{previewData.length} records</span>. Align your source columns with the target ledger fields below.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries({
                    amount: 'Amount (Required)',
                    category: 'Category (Required)',
                    type: 'Flow Type',
                    date: 'Timestamp',
                    note: 'Description'
                  }).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{label}</label>
                      <select 
                        value={mapping[key]} 
                        onChange={(e) => setMapping({...mapping, [key]: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white h-14 rounded-2xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900">-- Bypass --</option>
                        {columns.map(col => <option key={col} value={col} className="bg-slate-900">{col}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
                  <button onClick={() => setStep(1)} className="h-16 px-8 rounded-3xl border border-white/10 text-slate-400 font-bold hover:text-white hover:bg-white/5 transition-all">BACK</button>
                  <Button 
                     onClick={handleImport} 
                     disabled={loading} 
                     className="flex-1 h-16 rounded-3xl bg-white text-slate-950 hover:bg-slate-100 font-black text-lg"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24}/> : <div className="flex items-center justify-center gap-2">EXECUTE MASS IMPORT <Layers size={20} /></div>}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CSVModal;
