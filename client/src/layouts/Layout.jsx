import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaRocket, FaMoon, FaSun } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, canAccessAdmin, canAccessJudge, canAccessOrganizer } from '../utils/rbac';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Hackathons', to: '/hackathons' },
  { label: 'Leaderboard', to: '/leaderboard' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('hackverse-theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('hackverse-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className="min-h-screen bg-transparent text-forest transition-colors duration-300">
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="sticky top-0 z-50 border-b border-white/40 bg-white/40 backdrop-blur-2xl transition-colors duration-300 dark:border-emerald-100/10 dark:bg-[#0d211d]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3 text-xl font-semibold">
            <div className="rounded-full bg-forest p-3 text-cream shadow-premium"><FaLeaf /></div>
            <span className="font-display tracking-[0.2em]">HackVerse</span>
          </NavLink>
          <nav className="hidden items-center gap-6 rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-lg backdrop-blur md:flex dark:border-emerald-100/10 dark:bg-[#17372f]/80">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `transition hover:text-forest/80 ${isActive ? 'font-semibold text-forest' : 'text-forest/70'}`}>
                {item.label}
              </NavLink>
            ))}
            {user && canAccessAdmin(user) && <NavLink to="/dashboard" className="text-forest/70 transition hover:text-forest/80">Admin</NavLink>}
            {user && canAccessOrganizer(user) && <NavLink to="/dashboard" className="text-forest/70 transition hover:text-forest/80">Organizer</NavLink>}
            {user && canAccessJudge(user) && <NavLink to="/dashboard" className="text-forest/70 transition hover:text-forest/80">Judge</NavLink>}
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDark((current) => !current)}
              className="grid h-10 w-10 place-items-center rounded-full border border-forest/20 bg-white/70 text-forest transition hover:scale-105 hover:bg-cream dark:border-emerald-100/15 dark:bg-[#17372f] dark:text-[#e4f1dc] dark:hover:bg-[#245044]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
            </button>
            {user ? (
              <>
                <NavLink to="/dashboard" className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream transition hover:scale-105">Dashboard</NavLink>
                {user.role === ROLES.ADMIN && <span className="rounded-full bg-cream px-3 py-2 text-xs font-semibold text-forest">Admin</span>}
                {user.role === ROLES.ORGANIZER && <span className="rounded-full bg-cream px-3 py-2 text-xs font-semibold text-forest">Organizer</span>}
                {user.role === ROLES.JUDGE && <span className="rounded-full bg-cream px-3 py-2 text-xs font-semibold text-forest">Judge</span>}
                {user.role === ROLES.PARTICIPANT && <span className="rounded-full bg-cream px-3 py-2 text-xs font-semibold text-forest">Participant</span>}
                <button onClick={logout} className="rounded-full border border-forest/20 bg-white/70 px-4 py-2 text-sm font-semibold">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="rounded-full border border-forest/20 bg-white/70 px-4 py-2 text-sm font-semibold">Login</NavLink>
                <NavLink to="/signup" className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream">Join Now</NavLink>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="mx-auto mt-16 max-w-7xl px-6 pb-10 text-sm text-forest/70 lg:px-8">
        <div className="rounded-[2rem] border border-white/60 bg-white/50 p-6 shadow-xl backdrop-blur dark:border-emerald-100/10 dark:bg-[#17372f]/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 HackVerse. A premium hackathon management platform.</p>
            <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDark((current) => !current)}
              className="grid h-10 w-10 place-items-center rounded-full border border-forest/20 bg-white/70 text-forest transition hover:scale-105 hover:bg-cream dark:border-emerald-100/15 dark:bg-[#17372f] dark:text-[#e4f1dc] dark:hover:bg-[#245044]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
            </button>
              <FaRocket className="text-forest" />
              <span>Built for ambitious builders</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
