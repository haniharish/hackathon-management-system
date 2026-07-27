import User from '../models/User.js';
import Hackathon from '../models/Hackathon.js';
import Submission from '../models/Submission.js';
import Registration from '../models/Registration.js';
import { getFallbackStats, getFallbackUsers } from '../utils/fallbackData.js';
import { sanitizeUser } from '../utils/auth.js';

const isDbConnected = () => User.db?.readyState === 1;

export const listUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    if (!isDbConnected()) {
      let users = getFallbackUsers().map(({ password, ...u }) => sanitizeUser(u));
      if (role) users = users.filter((u) => u.role === role);
      if (search) {
        const q = search.toLowerCase();
        users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      return res.json({ users, total: users.length });
    }

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    res.json({ users: users.map(sanitizeUser), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['admin', 'organizer', 'participant', 'judge'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user: sanitizeUser(user), message: user.isActive ? 'User unblocked' : 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const platformAnalytics = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const stats = getFallbackStats();
      return res.json({
        ...stats,
        registrations: 0,
        teams: 0,
        byRole: { admin: 1, organizer: 0, participant: 0, judge: 0 },
      });
    }

    const [hackathons, submissions, users, registrations, byRoleAgg] = await Promise.all([
      Hackathon.countDocuments(),
      Submission.countDocuments(),
      User.countDocuments(),
      Registration.countDocuments({ status: 'registered' }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

    const byRole = { admin: 0, organizer: 0, participant: 0, judge: 0 };
    byRoleAgg.forEach((row) => {
      if (byRole[row._id] !== undefined) byRole[row._id] = row.count;
    });

    res.json({ hackathons, submissions, users, registrations, byRole });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listJudges = async (_req, res) => {
  try {
    const judges = await User.find({ role: 'judge' }).select('-password').catch(() => []);
    res.json(judges.map(sanitizeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listOrganizers = async (_req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' }).select('-password').catch(() => []);
    res.json(organizers.map(sanitizeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
