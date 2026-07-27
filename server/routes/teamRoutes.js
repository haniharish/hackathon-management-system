import express from 'express';
import {
  listTeams,
  createTeam,
  joinTeam,
  updateTeam,
  inviteMember,
  leaveTeam,
  transferLeadership,
  approveTeam,
  rejectTeam,
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('admin', 'organizer', 'participant', 'judge'), listTeams);
router.post('/', authorizeRoles('participant', 'admin'), createTeam);
router.post('/:id/join', authorizeRoles('participant', 'admin'), validateObjectId('id'), joinTeam);
router.put('/:id', authorizeRoles('participant', 'admin'), validateObjectId('id'), updateTeam);

router.post('/:id/invite', authorizeRoles('participant', 'admin'), validateObjectId('id'), inviteMember);
router.post('/:id/leave', authorizeRoles('participant', 'admin'), validateObjectId('id'), leaveTeam);
router.post('/:id/transfer', authorizeRoles('participant', 'admin'), validateObjectId('id'), transferLeadership);
router.patch('/:id/approve', authorizeRoles('admin', 'organizer'), validateObjectId('id'), approveTeam);
router.patch('/:id/reject', authorizeRoles('admin', 'organizer'), validateObjectId('id'), rejectTeam);

export default router;
