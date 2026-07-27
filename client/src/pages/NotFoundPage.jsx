import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }} className="rounded-[3rem] border border-white/70 bg-white/80 p-8 text-center shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.35em] text-forest/60">404</p>
      <h1 className="mt-3 text-4xl font-semibold">The page you seek is nowhere to be found.</h1>
      <Link to="/" className="mt-8 inline-block rounded-full bg-forest px-6 py-3 font-semibold text-cream">Back home</Link>
    </motion.div>
  );
}
