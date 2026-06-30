import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { sendRealTimeNotification } from '../services/socketService.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';

// Helper to create & dispatch notification
const createAndSendNotification = async (userId, message) => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
    });
    sendRealTimeNotification(userId, notification);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin only)
export const createTask = async (req, res, next) => {
  const { title, description, status, priority, dueDate, assignee, projectId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate,
      assignee: assignee || null,
      project: projectId,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role avatar')
      .populate('project', 'name owner');

    if (assignee) {
      await createAndSendNotification(
        assignee,
        `You have been assigned a new task: "${title}" in project "${project.name}"`
      );
    }

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getProjectTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email role avatar')
      .populate('project', 'name owner')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email role avatar')
      .populate('project', 'name owner');

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private (Admin only)
export const updateTask = async (req, res, next) => {
  const { title, description, status, priority, dueDate, assignee } = req.body;

  try {
    const task = await Task.findById(req.params.id).populate('project', 'name owner');

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    const prevAssignee = task.assignee ? task.assignee.toString() : null;

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignee = assignee !== undefined ? assignee : task.assignee;

    const updatedTask = await task.save();
    const populated = await Task.findById(updatedTask._id)
      .populate('assignee', 'name email role avatar')
      .populate('project', 'name owner');

    if (assignee && assignee.toString() !== prevAssignee) {
      await createAndSendNotification(
        assignee,
        `You have been assigned to the task: "${task.title}" in project "${task.project.name}"`
      );
    }

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res, next) => {
  const { status } = req.body;

  if (!['To Do', 'In Progress', 'Done'].includes(status)) {
    res.status(400);
    return next(new Error('Invalid task status'));
  }

  try {
    const task = await Task.findById(req.params.id).populate('project', 'name owner');

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    const isProjectOwner = task.project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';

    if (!isAdmin && !isProjectOwner && !isAssignee) {
      res.status(403);
      return next(new Error('Not authorized to update status of this task'));
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role avatar')
      .populate('project', 'name owner');

    if (status === 'Done' && oldStatus !== 'Done' && !isProjectOwner) {
      await createAndSendNotification(
        task.project.owner,
        `Task "${task.title}" has been marked as DONE by ${req.user.name}`
      );
    }

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    if (task.assignee) {
      await createAndSendNotification(
        task.assignee,
        `The task "${task.title}" assigned to you has been deleted.`
      );
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload attachments to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
export const uploadAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'name owner');
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    const isProjectOwner = task.project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';

    if (!isAdmin && !isProjectOwner && !isAssignee) {
      res.status(403);
      return next(new Error('Not authorized to upload attachments to this task'));
    }

    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded'));
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
    
    const attachment = {
      name: req.file.originalname,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    task.attachments.push(attachment);
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role avatar')
      .populate('project', 'name owner');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};
