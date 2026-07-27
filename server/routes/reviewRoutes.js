import express from 'express';
import { submitReview, getReviewsForSubmission, getJudgeAssignments } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/assignments', authorizeRoles('judge', 'admin'), getJudgeAssignments);
router.get('/submission/:submissionId', authorizeRoles('admin', 'organizer', 'judge'), validateObjectId('submissionId'), getReviewsForSubmission);
router.post('/', authorizeRoles('judge', 'admin'), submitReview);

export default router;
