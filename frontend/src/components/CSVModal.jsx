import React, { useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Layers, Loader2, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Button } from './ui/Button';

const CSVModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({ amount: '', type: '', category: '', date: '', note: '' });

  if (!isOpen) return null;

  const reset = () => {
    setStep(1);
    setFile(null);
    setPreviewData([]);
    setColumns([]);
    setMapping({ amount: '', type: '', category: '', date: '', note: '' });
  };

  const close = () => {
    reset();
    onClose();
  };

  const handlePreview = async (event) => {
    event.preventDefault();
    if (!file) return toast.error('Choose a CSV file first');

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const { data } = await api.post('/transactions/csv/preview', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setColumns(data.columns || []);
      setPreviewData(data.fullData || []);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'The CSV could not be read');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!mapping.amount || !mapping.category) return toast.error('Map amount and category before importing');

    const mappedData = previewData.map((row) => ({
      amount: Math.abs(parseFloat(row[mapping.amount])) || 0,
      type: mapping.type && row[mapping.type] ? row[mapping.type].toLowerCase() : 'expense',
      category: row[mapping.category] || 'Other',
      date: mapping.date && row[mapping.date] ? new Date(row[mapping.date]) : new Date(),
      note: mapping.note && row[mapping.note] ? row[mapping.note] : '',
    })).filter((row) => ['income', 'expense'].includes(row.type) && row.amount > 0);

    setLoading(true);
    try {
      const { data } = await api.post('/transactions/csv/import', { mappedData });
      toast.success(`Imported ${data.count} entries`);
      close();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'The CSV could not be imported');
    } finally {
      setLoading(false);
    }
  };

  const fields = {
    amount: 'Amount',
    category: 'Category',
    type: 'Type',
    date: 'Date',
    note: 'Note',
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="csv-dialog-title">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <span className="brand-mark"><FileSpreadsheet size={18} /></span>
            <div><p className="section-note">Ledger import</p><h2 id="csv-dialog-title">Bring in a CSV</h2></div>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close import dialog"><X size={19} /></button>
        </div>

        <div className="flex items-center gap-2 border-b border-[var(--soft-line)] px-5 py-3 text-xs font-semibold text-[var(--muted)] md:px-6">
          <span className={step === 1 ? 'text-[var(--ink)]' : ''}>1. Choose file</span><span>/</span><span className={step === 2 ? 'text-[var(--ink)]' : ''}>2. Match columns</span>
        </div>

        {step === 1 && (
          <form onSubmit={handlePreview} className="grid gap-5 p-5 md:p-6">
            <label className="upload-zone">
              <input type="file" accept=".csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              <UploadCloud size={28} />
              <strong>{file ? file.name : 'Choose a CSV file'}</strong>
              <span>UTF-8 CSV files work best.</span>
            </label>
            <Button type="submit" disabled={!file || loading}>{loading ? <Loader2 size={17} className="animate-spin" /> : 'Continue'}</Button>
          </form>
        )}

        {step === 2 && (
          <div className="grid gap-5 p-5 md:p-6">
            <div className="import-note"><CheckCircle2 size={17} /><span>{previewData.length} records found. Match your columns to FlowAI fields.</span></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(fields).map(([key, label]) => (
                <div key={key}>
                  <label className="field-label" htmlFor={`csv-${key}`}>{label}{['amount', 'category'].includes(key) ? ' (required)' : ''}</label>
                  <select id={`csv-${key}`} value={mapping[key]} onChange={(event) => setMapping({ ...mapping, [key]: event.target.value })} className="field-control">
                    <option value="">Skip</option>
                    {columns.map((column) => <option key={column} value={column}>{column}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t border-[var(--soft-line)] pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button type="button" disabled={loading} onClick={handleImport}>{loading ? <Loader2 size={17} className="animate-spin" /> : <><Layers size={16} /> Import entries</>}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVModal;
