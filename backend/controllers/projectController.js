import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendRealTimeNotification } from '../services/socketService.js';

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

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin only)
export const createProject = async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [],
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role avatar');

    res.status(201).json(populatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (User's owned or joined projects)
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role.toLowerCase() !== 'admin') {
      query = {
        $or: [
          { owner: req.user._id },
          { members: req.user._id }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role avatar')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role avatar');

    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    if (
      req.user.role.toLowerCase() !== 'admin' &&
      project.owner.toString() !== req.user._id.toString() &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      res.status(403);
      return next(new Error('Not authorized to access this project'));
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
export const updateProject = async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    project.name = name || project.name;
    project.description = description || project.description;

    const updatedProject = await project.save();
    const populated = await Project.findById(updatedProject._id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    for (const memberId of project.members) {
      await createAndSendNotification(
        memberId,
        `Project "${project.name}" has been deleted by Admin.`
      );
    }

    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite a member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin only)
export const inviteMember = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    const userToInvite = await User.findById(userId);
    if (!userToInvite) {
      res.status(404);
      return next(new Error('User to invite not found'));
    }

    if (project.members.includes(userId)) {
      res.status(400);
      return next(new Error('User is already a member of this project'));
    }

    project.members.push(userId);
    await project.save();

    await createAndSendNotification(
      userId,
      `You have been added to the project: "${project.name}"`
    );

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role avatar');

    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin only)
export const removeMember = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    if (!project.members.map(m => m.toString()).includes(userId)) {
      res.status(400);
      return next(new Error('User is not a member of this project'));
    }

    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();

    await createAndSendNotification(
      userId,
      `You have been removed from the project: "${project.name}"`
    );

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role avatar');

    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};
