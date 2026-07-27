import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SignupPage() {
  const location = useLocation();
  const prefilledEmail = location.state?.email || '';
  const notice = location.state?.notice || '';

  const [form, setForm] = useState({
    name: '',
    email: prefilledEmail,
    password: '',
    role: 'participant',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Name, valid email, and password (6+ chars) are required');
      return;
    }
    setSubmitting(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password, form.role);
      toast('Account created — welcome to HackVerse!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }} className="mx-auto max-w-2xl rounded-[3rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.35em] text-forest/60">Create your account</p>
      <h1 className="mt-3 text-4xl font-semibold">Join HackVerse</h1>
      {notice && <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input required className="w-full rounded-full border border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" className="w-full rounded-full border border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required minLength={6} className="w-full rounded-full border border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest" placeholder="Password (min 6 characters)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full rounded-full border border-forest/20 bg-cream/50 px-4 py-3 outline-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="participant">Participant — join hackathons & submit projects</option>
          <option value="organizer">Organizer — create & manage events</option>
          <option value="judge">Judge — evaluate submissions</option>
        </select>
        <p className="text-xs text-forest/60">Admin accounts are assigned by platform administrators only.</p>
        <button disabled={submitting} className="w-full rounded-full bg-forest px-5 py-3 font-semibold text-cream transition hover:scale-[1.01] disabled:opacity-60">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-sm text-forest/70">Already have an account? <Link to="/login" className="font-semibold text-forest">Log in</Link></p>
    </motion.div>
  );
}
