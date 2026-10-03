import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, ArrowRight, Loader2, Mail, Lock, User } from 'lucide-react';
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUpWithEmail(email, password, firstName, lastName);
      toast.success('Your account is ready');
      navigate('/');
    } catch (err) {
      setError(err.message || 'We could not create your account.');
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
          <h1>Start with a clearer view.</h1>
          <p>
            Bring your everyday money into one calm place. FlowAI helps you
            notice the pattern before it becomes a problem.
          </p>
        </div>
        <div className="auth-story-note">
          <span className="h-2 w-2 rounded-full bg-[#b7c9b0]" />
          A small habit with a useful return.
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="brand-mark">
            <Activity size={18} />
          </div>
          <h2>Create your account</h2>
          <p>Start with the essentials. You can shape the rest later.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-grid">
              <div>
                <label className="field-label" htmlFor="firstName">First name</label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  icon={<User size={17} />}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="lastName">Last name</label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="register-email">Email address</label>
              <Input
                id="register-email"
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
              <label className="field-label" htmlFor="register-password">Password</label>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
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
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create account <ArrowRight size={17} /></>}
            </Button>
          </form>

          <div className="auth-divider">or continue with</div>

          <button type="button" onClick={handleGoogleSignup} disabled={loading} className="button-secondary w-full">
            <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" className="h-4 w-4" alt="" />
            Google
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
