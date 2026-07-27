import Hackathon from '../models/Hackathon.js';
import Registration from '../models/Registration.js';
import { getFallbackHackathons } from '../utils/fallbackData.js';

const isDbConnected = () => Hackathon.db?.readyState === 1;

const canManageHackathon = (hackathon, user) =>
  user.role === 'admin' || hackathon.organizer.toString() === user._id.toString();

export const listHackathons = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const { search, status, mode } = req.query;

    if (!isDbConnected()) {
      let items = getFallbackHackathons();
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(
          (h) =>
            h.title.toLowerCase().includes(q) ||
            h.theme.toLowerCase().includes(q) ||
            h.description.toLowerCase().includes(q)
        );
      }
      if (status) items = items.filter((h) => h.status === status);
      if (mode) items = items.filter((h) => (h.mode || (h.isOnline ? 'online' : 'offline')) === mode);
      const total = items.length;
      const paginated = items.slice(skip, skip + limit);
      return res.json({ hackathons: paginated, total, page, pages: Math.ceil(total / limit) || 1 });
    }

    const filter = {};
    if (req.query.mine === 'true' && req.user?.role === 'organizer') filter.organizer = req.user._id;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { theme: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (mode) filter.mode = mode;

    const [hackathons, total] = await Promise.all([
      Hackathon.find(filter).populate('organizer', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Hackathon.countDocuments(filter),
    ]);

    res.json({ hackathons, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHackathon = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const fallback = getFallbackHackathons().find((item) => item._id === req.params.id);
      if (!fallback) return res.status(404).json({ message: 'Hackathon not found' });
      return res.json(fallback);
    }

    const hackathon = await Hackathon.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('assignedJudges', 'name email role')
      .populate('participants', 'name email');

    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHackathon = async (req, res) => {
  try {
    const required = ['title', 'description', 'theme', 'venue', 'prizePool', 'startDate', 'endDate', 'registrationDeadline'];
    for (const field of required) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const payload = {
      ...req.body,
      organizer: req.user._id,
      mode: req.body.mode || (req.body.isOnline ? 'online' : 'hybrid'),
      status: req.body.status || 'open',
      registrationOpen: req.body.registrationOpen !== false,
    };

    const hackathon = await Hackathon.create(payload);
    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    if (!canManageHackathon(hackathon, req.user)) {
      return res.status(403).json({ message: 'Not authorized to edit this hackathon' });
    }

    const updated = await Hackathon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (!canManageHackathon(hackathon, req.user)) return res.status(403).json({ message: 'Not authorized to delete this hackathon' });
    await Hackathon.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ hackathon: req.params.id });
    res.json({ message: 'Hackathon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (!hackathon.registrationOpen || hackathon.status === 'closed') {
      return res.status(400).json({ message: 'Registration is closed for this hackathon' });
    }
    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    const existing = await Registration.findOne({ hackathon: hackathon._id, user: req.user._id, status: { $in: ['pending', 'approved'] } });
    if (existing) return res.status(400).json({ message: 'You are already registered' });

    await Registration.findOneAndUpdate({ hackathon: hackathon._id, user: req.user._id }, { status: 'pending' }, { upsert: true, new: true });
    res.status(201).json({ message: 'Registration submitted for organizer approval.', status: 'pending' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already registered' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOneAndUpdate(
      { hackathon: req.params.id, user: req.user._id, status: { $in: ['pending', 'approved'] } },
      { status: 'cancelled' }, { new: true }
    );
    if (!registration) return res.status(404).json({ message: 'No active registration found' });
    await Hackathon.findByIdAndUpdate(req.params.id, {
      $pull: { participants: req.user._id },
    });
    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleRegistration = async (req, res) => {
  try {
    const { open } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (!canManageHackathon(hackathon, req.user)) return res.status(403).json({ message: 'Not authorized' });
    hackathon.registrationOpen = Boolean(open);
    hackathon.status = open ? 'open' : 'closed';
    await hackathon.save();
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignJudges = async (req, res) => {
  try {
    const { judgeIds } = req.body;
    const existing = await Hackathon.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Hackathon not found' });
    if (!canManageHackathon(existing, req.user)) return res.status(403).json({ message: 'Not authorized' });
    if (!Array.isArray(judgeIds)) {
      return res.status(400).json({ message: 'judgeIds array is required' });
    }
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { assignedJudges: judgeIds },
      { new: true }
    ).populate('assignedJudges', 'name email');
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishWinners = async (req, res) => {
  try {
    const { winnerSubmissionIds } = req.body;
    const existing = await Hackathon.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Hackathon not found' });
    if (!canManageHackathon(existing, req.user)) return res.status(403).json({ message: 'Not authorized' });
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { winners: winnerSubmissionIds || [], status: 'completed' },
      { new: true }
    );
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id }).populate('hackathon', 'title theme startDate registrationOpen').sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getManagedRegistrations = async (req, res) => {
  try {
    const events = await Hackathon.find(req.user.role === 'admin' ? {} : { organizer: req.user._id }).select('_id');
    const registrations = await Registration.find({ hackathon: { $in: events.map((event) => event._id) } }).populate('user', 'name email').populate('hackathon', 'title').sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be approved or rejected' });
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (!canManageHackathon(hackathon, req.user)) return res.status(403).json({ message: 'Not authorized' });
    const registration = await Registration.findOne({ _id: req.params.registrationId, hackathon: hackathon._id });
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    registration.status = status;
    await registration.save();
    if (status === 'approved' && !hackathon.participants.some((userId) => userId.toString() === registration.user.toString())) hackathon.participants.push(registration.user);
    if (status === 'rejected') hackathon.participants = hackathon.participants.filter((userId) => userId.toString() !== registration.user.toString());
    await hackathon.save();
    res.json(registration);
  } catch (error) { res.status(500).json({ message: error.message }); }
};