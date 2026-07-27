import { Navigate, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './layouts/Layout';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import HackathonsPage from './pages/HackathonsPage';
import HackathonDetailsPage from './pages/HackathonDetailsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SubmissionPage from './pages/SubmissionPage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ROLES } from './utils/rbac';

const pageTransition = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 },
  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
};

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<motion.div {...pageTransition}><LandingPage /></motion.div>} />
          <Route path="/about" element={<motion.div {...pageTransition}><AboutPage /></motion.div>} />
          <Route path="/hackathons" element={<motion.div {...pageTransition}><HackathonsPage /></motion.div>} />
          <Route path="/hackthons" element={<Navigate to="/hackathons" replace />} />
          <Route path="/hackathons/:id" element={<motion.div {...pageTransition}><HackathonDetailsPage /></motion.div>} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<motion.div {...pageTransition}><LoginPage /></motion.div>} />
            <Route path="/signup" element={<motion.div {...pageTransition}><SignupPage /></motion.div>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMINISTRATOR, ROLES.ADMIN, ROLES.ORGANIZER, ROLES.PARTICIPANT, ROLES.JUDGE]} />}>
            <Route path="/dashboard" element={<motion.div {...pageTransition}><DashboardPage /></motion.div>} />
            <Route path="/leaderboard" element={<motion.div {...pageTransition}><LeaderboardPage /></motion.div>} />
            <Route path="/submission" element={<motion.div {...pageTransition}><SubmissionPage /></motion.div>} />
            <Route path="/team" element={<motion.div {...pageTransition}><TeamPage /></motion.div>} />
            <Route path="/profile" element={<motion.div {...pageTransition}><ProfilePage /></motion.div>} />
          </Route>
          <Route path="*" element={<motion.div {...pageTransition}><NotFoundPage /></motion.div>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;