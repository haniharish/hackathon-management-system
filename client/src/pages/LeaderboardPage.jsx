import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const items = [
    { name: 'NovaGrid AI', score: 96 },
    { name: 'CivicMint', score: 92 },
    { name: 'Orbit Labs', score: 89 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }} className="rounded-[3rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.35em] text-forest/60">Leaderboard</p>
      <h1 className="mt-3 text-4xl font-semibold">Top submissions this season</h1>
      <div className="mt-8 space-y-4">
        {items.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between rounded-[1.5rem] border border-forest/10 bg-cream/60 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-lg font-semibold text-cream">{index + 1}</div>
              <div>
                <div className="font-semibold text-forest">{item.name}</div>
                <div className="text-sm text-forest/70">Outstanding impact and execution</div>
              </div>
            </div>
            <div className="text-2xl font-semibold text-forest">{item.score}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
