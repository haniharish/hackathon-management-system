import express from 'express';
import {
  listUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  platformAnalytics,
  listJudges,
  listOrganizers,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

// Organizers may view judges solely to assign them to their own hackathons.
router.get('/judges', authorizeRoles('admin', 'organizer'), listJudges);

router.use(authorizeRoles('admin'));
router.get('/', listUsers);
router.get('/analytics', platformAnalytics);
router.get('/organizers', listOrganizers);
router.patch('/:id/role', validateObjectId('id'), updateUserRole);
router.patch('/:id/block', validateObjectId('id'), toggleBlockUser);
router.delete('/:id', validateObjectId('id'), deleteUser);

export default router;
