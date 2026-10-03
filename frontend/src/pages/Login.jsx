import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import useAuthContext from '../context/useAuthContext';

const Login = () => {
  const { signInWithEmail, signInWithGoogle } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'We could not sign you in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in did not complete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-story">
        <div>
          <div className="brand-lockup">
            <span className="brand-mark"><Activity size={18} /></span>
            <span>
              <span className="brand-name text-white">FlowAI</span>
              <span className="brand-note text-white/50">personal finance</span>
            </span>
          </div>
          <h1>Make room for the month ahead.</h1>
          <p>
            A clear view of what is coming in, what is leaving, and what you can
            comfortably do next.
          </p>
        </div>
        <div className="auth-story-note">
          <span className="h-2 w-2 rounded-full bg-[#b7c9b0]" />
          Your data, your pace, your decisions.
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="brand-mark">
            <Activity size={18} />
          </div>
          <h2>Welcome back</h2>
          <p>Sign in to pick up where you left off.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                icon={<Mail size={17} />}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                icon={<Lock size={17} />}
              />
            </div>

            {error && (
              <div className="error-message" role="alert">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign in <ArrowRight size={17} /></>}
            </Button>
          </form>

          <div className="auth-divider">or continue with</div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="button-secondary w-full">
            <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" className="h-4 w-4" alt="" />
            Google
          </button>

          <p className="auth-footer">
            New to FlowAI? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
