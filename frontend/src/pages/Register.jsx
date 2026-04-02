import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, User, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import useAuthContext from '../context/useAuthContext';

const Register = () => {
  const { signUpWithEmail, signInWithGoogle } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUpWithEmail(email, password, firstName, lastName);
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/3 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="mb-10 text-center relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-6 shadow-[0_0_40px_-5px_rgba(147,51,234,0.4)]"
            >
              <Activity className="text-white" size={32} />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
              Join FlowAI
            </h1>
            <p className="text-slate-400 font-medium">
              The next evolution of finance starts here
            </p>
          </div>

          <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 gap-4">
                 <button 
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/8 transition-all text-white font-bold text-sm"
                 >
                    <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" className="w-5 h-5" alt="Google" />
                    Google
                 </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                  <span className="bg-slate-950 px-4 text-slate-600">Manual Induction</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Given Name</label>
                      <Input
                        type="text"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="bg-white/3 border-white/5 text-white h-14 rounded-2xl"
                        icon={<User size={18} className="text-slate-500" />}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Family Name</label>
                      <Input
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="bg-white/3 border-white/5 text-white h-14 rounded-2xl"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Universal Identity</label>
                  <Input
                    type="email"
                    placeholder="identity@flowai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/3 border-white/5 text-white h-14 rounded-2xl"
                    icon={<Mail size={18} className="text-slate-500" />}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Access Cipher</label>
                  <Input
                    type="password"
                    placeholder="Min. 8 entropy characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/3 border-white/5 text-white h-14 rounded-2xl"
                    icon={<Lock size={18} className="text-slate-500" />}
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
                  className="w-full h-14 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-lg transition-all shadow-xl shadow-brand-600/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : (
                    <span className="flex items-center gap-2">
                      Initialize Link <ArrowRight size={22} />
                    </span>
                  )}
                </Button>
              </form>
            </div>

          <div className="mt-10 text-center relative z-10 border-t border-white/5 pt-8">
            <p className="text-slate-500 text-sm font-medium">
              Already established?{' '}
              <Link to="/login" className="text-brand-400 font-bold hover:underline">Resonate</Link>
            </p>
          </div>
        </div>

        <motion.p 
          className="text-center mt-10 text-slate-700 text-[10px] font-black tracking-[0.3em] uppercase"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          FlowAI Secure Onboarding 2026
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
