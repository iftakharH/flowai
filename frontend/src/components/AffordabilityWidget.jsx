import React, { useState } from 'react';
import api from '../services/api';
import { Search, Loader2, Sparkles, CheckCircle2, AlertTriangle, XCircle, ChevronRight, Activity } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

const AffordabilityWidget = () => {
  const [cost, setCost] = useState('');
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!cost || isNaN(cost)) return;
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/insights/affordability', { cost: Number(cost) });
      setInsight(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze affordability.');
    } finally {
      setLoading(false);
    }
  };

  const statusIcons = {
    safe: { Icon: CheckCircle2, color: 'text-brand-500', bg: 'bg-brand-500/10', label: 'Recommended' },
    risky: { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Caution Advised' },
    danger: { Icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Hold Off' }
  };

  const getStatus = (data) => {
    if (!data.canAfford) return statusIcons.danger;
    if (data.message.includes('very little buffer')) return statusIcons.risky;
    return statusIcons.safe;
  };

  return (
    <Card className="h-full border-blue-500/20 group relative overflow-hidden bg-white/[0.02]">
      {/* Dynamic Background Glow */}
      <AnimatePresence>
         {insight && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
               className={`absolute inset-0 blur-[100px] ${getStatus(insight).bg}`}
            />
         )}
      </AnimatePresence>

      <CardContent className="h-full flex flex-col p-10 relative z-10 transition-transform duration-500 group-hover:scale-[1.01]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
             <Activity size={24} />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Purchase Simulator</h3>
        </div>
        
        <p className="text-slate-400 font-medium mb-8 max-w-sm">
          Simulate any future expense against your current liquidity and predicted cash flow.
        </p>

        <form onSubmit={handleCheck} className="flex gap-4 mb-10">
          <Input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-white/5 border-white/10 text-white h-16 text-xl rounded-2xl px-6 focus:ring-blue-500/50"
            icon={<span className="text-slate-500 font-bold">$</span>}
          />
          <Button
            type="submit"
            disabled={loading || !cost}
            className="h-16 px-10 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-lg shadow-xl shadow-blue-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <div className="flex items-center gap-2">SIMULATE <ChevronRight size={20} /></div>}
          </Button>
        </form>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!insight && !error && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-[2rem] text-slate-600"
               >
                  <Sparkles size={48} className="mb-4 opacity-50" />
                  <p className="text-sm font-bold uppercase tracking-widest">Awaiting Simulation</p>
               </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 text-sm font-bold flex items-center gap-3">
                <XCircle size={20} /> {error}
              </motion.div>
            )}

            {insight && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 p-8 rounded-[2rem] bg-white/5 border border-white/10">
                   <div className={`shrink-0 w-20 h-20 rounded-3xl ${getStatus(insight).bg} flex items-center justify-center ${getStatus(insight).color} shadow-[0_0_30px_#000000]`}>
                      {React.createElement(getStatus(insight).Icon, { size: 40 })}
                   </div>
                   <div>
                      <h4 className={`text-xl font-black mb-1 ${getStatus(insight).color} tracking-tight`}>
                         {getStatus(insight).label}
                      </h4>
                      <p className="text-slate-300 font-medium text-sm leading-relaxed">
                         {insight.message}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact Ratio</p>
                      <p className="text-xl font-black text-white">{((insight.cost / insight.currentBalance) * 100).toFixed(1)}%</p>
                   </div>
                   <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Post-Auth Days</p>
                      <p className="text-xl font-black text-white">{insight.daysLeft}</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffordabilityWidget;
