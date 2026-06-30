import express from 'express';
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  uploadAttachment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { roleCheck } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', roleCheck('Admin'), createTask);
router.get('/project/:projectId', getProjectTasks);

router.route('/:id')
  .get(getTaskById)
  .put(roleCheck('Admin'), updateTask)
  .delete(roleCheck('Admin'), deleteTask);

router.patch('/:id/status', updateTaskStatus);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);

export default router;
