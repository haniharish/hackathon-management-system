import express from 'express';
import {
  listHackathons,
  getHackathon,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  registerForHackathon,
  cancelRegistration,
  toggleRegistration,
  assignJudges,
  publishWinners,
  getMyRegistrations,
  getManagedRegistrations,
  updateRegistrationStatus,
} from '../controllers/hackathonController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, listHackathons);
router.get('/registrations/mine', protect, authorizeRoles('participant', 'admin'), getMyRegistrations);
router.get('/registrations/managed', protect, authorizeRoles('organizer', 'admin'), getManagedRegistrations);
router.patch('/:id/registrations/:registrationId', protect, authorizeRoles('organizer', 'admin'), validateObjectId('id'), validateObjectId('registrationId'), updateRegistrationStatus);

router.get('/:id', optionalProtect, validateObjectId('id'), getHackathon);

router.post('/', protect, authorizeRoles('admin', 'organizer'), createHackathon);
router.put('/:id', protect, authorizeRoles('admin', 'organizer'), validateObjectId('id'), updateHackathon);
router.delete('/:id', protect, authorizeRoles('admin', 'organizer'), validateObjectId('id'), deleteHackathon);

router.post('/:id/register', protect, authorizeRoles('participant', 'admin'), validateObjectId('id'), registerForHackathon);
router.delete('/:id/register', protect, authorizeRoles('participant', 'admin'), validateObjectId('id'), cancelRegistration);
router.patch('/:id/registration', protect, authorizeRoles('admin', 'organizer'), validateObjectId('id'), toggleRegistration);
router.patch('/:id/judges', protect, authorizeRoles('admin', 'organizer'), validateObjectId('id'), assignJudges);
router.patch('/:id/winners', protect, authorizeRoles('admin', 'organizer'), validateObjectId('id'), publishWinners);

export default router;
