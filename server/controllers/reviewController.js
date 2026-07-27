import Review from '../models/Review.js';
import Submission from '../models/Submission.js';
import Hackathon from '../models/Hackathon.js';
import { recalculateSubmissionScore } from './submissionController.js';

const scoreFields = ['innovation', 'technicalComplexity', 'uiUx', 'functionality', 'scalability', 'documentation', 'presentation'];

export const submitReview = async (req, res) => {
  try {
    const { submissionId, comments, feedback, ...scores } = req.body;
    if (!submissionId) {
      return res.status(400).json({ message: 'submissionId is required' });
    }

    for (const field of scoreFields) {
      const val = scores[field];
      if (val !== undefined && (val < 0 || val > 10)) {
        return res.status(400).json({ message: `${field} must be between 0 and 10` });
      }
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const hackathon = await Hackathon.findById(submission.hackathon);
    const isAssigned =
      hackathon?.assignedJudges?.some((j) => j.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (req.user.role === 'judge' && !isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to judge this hackathon' });
    }

    const totalScore = scoreFields.reduce((total, field) => total + Number(scores[field] ?? 0), 0);

    const review = await Review.findOneAndUpdate(
      { submission: submissionId, judge: req.user._id },
      {
        submission: submissionId,
        judge: req.user._id,
        comments: comments || '',
        feedback: feedback || '',
        innovation: scores.innovation ?? 0,
        technicalComplexity: scores.technicalComplexity ?? 0,
        uiUx: scores.uiUx ?? 0,
        functionality: scores.functionality ?? 0,
        scalability: scores.scalability ?? 0,
        documentation: scores.documentation ?? 0,
        presentation: scores.presentation ?? 0,
        totalScore,
      },
      { upsert: true, new: true, runValidators: true }
    );

    await recalculateSubmissionScore(submissionId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewsForSubmission = async (req, res) => {
  try {
    const reviews = await Review.find({ submission: req.params.submissionId })
      .populate('judge', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJudgeAssignments = async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ assignedJudges: req.user._id }).select('title status endDate');
    const submissions = await Submission.find({
      hackathon: { $in: hackathons.map((h) => h._id) },
    })
      .populate('team', 'name')
      .populate('hackathon', 'title');

    res.json({ hackathons, submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
