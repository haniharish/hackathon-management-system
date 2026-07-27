import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      toast('Welcome back to HackVerse!');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'USER_NOT_FOUND' || err.status === 404) {
        toast('No account found — please sign up first', 'error');
        navigate('/signup', {
          replace: true,
          state: {
            email: form.email.trim(),
            notice: 'Create an account to continue. You need to sign up before logging in.',
          },
        });
        return;
      }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }} className="mx-auto max-w-2xl rounded-[3rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.35em] text-forest/60">Welcome back</p>
      <h1 className="mt-3 text-4xl font-semibold">Sign in to HackVerse</h1>
      <p className="mt-2 text-sm text-forest/60">Demo: demo@hackverse.com / password123 (no DB) or run seed for full data</p>
      {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input required type="email" className="w-full rounded-full border border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required className="w-full rounded-full border border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={submitting} className="w-full rounded-full bg-forest px-5 py-3 font-semibold text-cream transition hover:scale-[1.01] disabled:opacity-60">
          {submitting ? 'Signing in…' : 'Login'}
        </button>
      </form>
      <p className="mt-5 text-sm text-forest/70">New here? <Link to="/signup" className="font-semibold text-forest">Create account</Link></p>
    </motion.div>
  );
}
