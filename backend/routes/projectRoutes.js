import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { roleCheck } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(roleCheck('Admin'), createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProjectById)
  .put(roleCheck('Admin'), updateProject)
  .delete(roleCheck('Admin'), deleteProject);

router.post('/:id/members', roleCheck('Admin'), inviteMember);
router.delete('/:id/members/:userId', roleCheck('Admin'), removeMember);

export default router;
