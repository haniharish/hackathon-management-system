import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function HackathonDetailsPage() {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);

  useEffect(() => {
    axios.get(`/api/hackathons/${id}`).then((response) => setHackathon(response.data));
  }, [id]);

  if (!hackathon) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }} className="rounded-[3rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.35em] text-forest/60">Event overview</p>
      <h1 className="mt-3 text-4xl font-semibold">{hackathon.title}</h1>
      <p className="mt-6 text-lg text-forest/70">{hackathon.description}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          ['Theme', hackathon.theme],
          ['Prize Pool', hackathon.prizePool],
          ['Venue', hackathon.venue],
          ['Team Size', hackathon.maxTeamSize],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.5rem] border border-forest/10 bg-cream/60 p-4">
            <div className="text-sm uppercase tracking-[0.2em] text-forest/60">{label}</div>
            <div className="mt-2 font-semibold text-forest">{value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
