import express from 'express';
import {
  listSubmissions,
  createSubmission,
  updateSubmission,
  getLeaderboard,
} from '../controllers/submissionController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/leaderboard', optionalProtect, getLeaderboard);

router.use(protect);

router.get('/', authorizeRoles('admin', 'organizer', 'judge', 'participant'), listSubmissions);
router.post('/', authorizeRoles('participant', 'admin'), createSubmission);
router.put('/:id', authorizeRoles('participant', 'admin'), validateObjectId('id'), updateSubmission);

export default router;
