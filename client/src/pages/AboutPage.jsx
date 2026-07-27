import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }} className="rounded-[3rem] border border-white/70 bg-white/70 p-8 shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.35em] text-forest/60">About HackVerse</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">A premium operating system for building unforgettable hackathons.</h1>
      <p className="mt-6 max-w-3xl text-lg text-forest/70">From onboarding participants to publishing winners, HackVerse gives every role a beautifully designed workflow with analytics, collaboration, and smooth execution.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {['Role-based dashboards', 'Fast submissions & judging', 'Premium collaboration experience'].map((item) => (
          <div key={item} className="rounded-[2rem] border border-forest/10 bg-cream/60 p-6">{item}</div>
        ))}
      </div>
    </motion.div>
  );
}
