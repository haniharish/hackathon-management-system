import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';
import Review from '../models/Review.js';
import { getFallbackSubmissions } from '../utils/fallbackData.js';

const isDbConnected = () => Submission.db?.readyState === 1;

export const listSubmissions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hackathon) filter.hackathon = req.query.hackathon;
    if (req.user.role === 'judge') {
      const assignedHackathons = await Hackathon.find({ assignedJudges: req.user._id }).select('_id');
      filter.hackathon = { $in: assignedHackathons.map((h) => h._id) };
    } else if (req.user.role === 'organizer') {
      const ownHackathons = await Hackathon.find({ organizer: req.user._id }).select('_id');
      filter.hackathon = { $in: ownHackathons.map((h) => h._id) };
    } else if (req.user.role === 'participant') {
      filter.submittedBy = req.user._id;
    }

    const submissions = await Submission.find(filter)
      .populate('submittedBy', 'name email')
      .populate('team', 'name')
      .populate('hackathon', 'title')
      .sort({ createdAt: -1 })
      .catch(() => []);

    if (!submissions.length && !isDbConnected()) {
      return res.json(getFallbackSubmissions());
    }
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubmission = async (req, res) => {
  try {
    const required = ['projectName', 'problemStatement', 'solution', 'hackathon'];
    for (const field of required) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const hackathon = await Hackathon.findById(req.body.hackathon);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    if (new Date() > new Date(hackathon.endDate)) {
      return res.status(400).json({ message: 'Submission deadline has passed' });
    }

    let teamId = req.body.team;
    if (!teamId) {
      const team = await Team.findOne({ hackathon: hackathon._id, members: req.user._id, status: 'approved' });
      teamId = team?._id;
    }

    const submission = await Submission.create({
      ...req.body,
      team: teamId,
      submittedBy: req.user._id,
      status: 'submitted',
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('hackathon');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const isOwner = submission.submittedBy.toString() === req.user._id.toString();
    if (!isOwner && !['admin', 'administrator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (isOwner && submission.hackathon && new Date() > new Date(submission.hackathon.endDate)) {
      return res.status(400).json({ message: 'Cannot edit after hackathon end date' });
    }

    const updated = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hackathon) filter.hackathon = req.query.hackathon;

    if (!isDbConnected()) {
      const items = getFallbackSubmissions()
        .sort((a, b) => b.score - a.score)
        .map((s, index) => ({
          rank: index + 1,
          teamName: 'Demo Team',
          projectName: s.projectName,
          totalScore: s.score,
          position: index + 1,
        }));
      return res.json(items);
    }

    const submissions = await Submission.find({ ...filter, status: { $in: ['submitted', 'reviewed', 'winner'] } })
      .populate('team', 'name')
      .sort({ score: -1 });

    const leaderboard = submissions.map((s, index) => ({
      rank: index + 1,
      teamName: s.team?.name || 'Individual',
      projectName: s.projectName,
      totalScore: s.score,
      position: index + 1,
      submissionId: s._id,
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recalculateSubmissionScore = async (submissionId) => {
  const reviews = await Review.find({ submission: submissionId });
  if (!reviews.length) return;
  const avg = reviews.reduce((sum, r) => sum + r.totalScore, 0) / reviews.length;
  await Submission.findByIdAndUpdate(submissionId, { score: Math.round(avg * 10) / 10, status: 'reviewed' });
};