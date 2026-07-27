import express from 'express';
import Hackathon from '../models/Hackathon.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { getFallbackStats } from '../utils/fallbackData.js';
import { platformAnalytics } from '../controllers/userController.js';

const router = express.Router();

router.get('/stats', protect, authorizeRoles('admin', 'organizer', 'participant', 'judge'), async (req, res) => {
  try {
    const connected = User.db?.readyState === 1;
    if (!connected) {
      return res.json(getFallbackStats());
    }

    if (['admin', 'administrator'].includes(req.user.role)) {
      return platformAnalytics(req, res);
    }

    if (req.user.role === 'organizer') {
      const hackathons = await Hackathon.countDocuments({ organizer: req.user._id });
      const teams = await Team.countDocuments();
      return res.json({ hackathons, teams, submissions: await Submission.countDocuments() });
    }

    if (req.user.role === 'judge') {
      const assigned = await Hackathon.countDocuments({ assignedJudges: req.user._id });
      return res.json({ assignedHackathons: assigned, pendingReviews: await Submission.countDocuments() });
    }

    const registrations = await Registration.countDocuments({ user: req.user._id, status: 'registered' });
    const myTeams = await Team.countDocuments({ members: req.user._id });
    res.json({ registrations, teams: myTeams, submissions: await Submission.countDocuments({ submittedBy: req.user._id }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;