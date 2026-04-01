import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Login = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isLoaded) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      } else {
        setError('Verification required. Please check your email.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (strategy) => {
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Orbs (Premium Purple aesthetic) */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-600/20 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="mb-10 text-center relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-6 shadow-[0_0_40px_-5px_rgba(147,51,234,0.4)]"
            >
              <Activity className="text-white" size={32} />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Welcome Back to FlowAI</h1>
            <p className="text-slate-400 font-medium">Your financial intelligence awaits</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Quantum Identity</label>
              <Input
                type="email"
                placeholder="     identity@flowai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/[0.03] border-white/5 text-white h-14 rounded-2xl px-6 focus:ring-brand-500/30"
                icon={<Mail size={20} className="text-slate-500" />}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Secret Key</label>
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-brand-400 hover:text-brand-300">Recover Authority</Link>
              </div>
              <Input
                type="password"
                placeholder="     ********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.03] border-white/5 text-white h-14 rounded-2xl px-6 focus:ring-brand-500/30"
                icon={<Lock size={20} className="text-slate-500" />}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-lg shadow-xl shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <span className="flex items-center gap-2">
                  Access Portal <ArrowRight size={20} />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-slate-950 px-4 text-slate-600">Neutral Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
             <button 
              onClick={() => handleSocialLogin('oauth_google')}
              className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all text-white font-bold text-sm"
             >
                <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" className="w-5 h-5" alt="Google" />
                Google
             </button>
             <button 
              onClick={() => handleSocialLogin('oauth_apple')}
              className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all text-white font-bold text-sm"
             >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                Apple
             </button>
          </div>

          <div className="mt-10 text-center relative z-10">
            <p className="text-slate-500 text-sm font-medium">
              Awaiting induction?{' '}
              <Link to="/register" className="text-brand-400 font-bold hover:underline">Establish Link</Link>
            </p>
          </div>
        </div>

        <motion.p 
          className="text-center mt-10 text-slate-700 text-[10px] font-black tracking-[0.3em] uppercase"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          FlowAI - 2026 by Purple Tech
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
