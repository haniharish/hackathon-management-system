import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }} className="rounded-[3rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.35em] text-forest/60">Profile</p>
      <h1 className="mt-3 text-4xl font-semibold">{user?.name || 'Your profile'}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-forest/10 bg-cream/60 p-5">Email: {user?.email || '—'}</div>
        <div className="rounded-[1.5rem] border border-forest/10 bg-cream/60 p-5">Role: {user?.role || 'participant'}</div>
      </div>
    </motion.div>
  );
}
