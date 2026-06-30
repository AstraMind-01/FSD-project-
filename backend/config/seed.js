import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

export const seedDatabase = async () => {
  try {
    // Check if users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping auto-seeding.');
      return;
    }

    console.log('Database is empty. Seeding sample data for DevBoard...');

    // 1. Create Users
    const admin = await User.create({
      name: 'Admin Alice',
      email: 'admin@devboard.com',
      password: 'admin123', // Will be hashed automatically by userSchema pre-save hook
      role: 'Admin',
    });

    const member = await User.create({
      name: 'Dev Dave',
      email: 'member@devboard.com',
      password: 'member123',
      role: 'Member',
    });

    console.log('Sample Users created:');
    console.log(`- Admin: admin@devboard.com / admin123`);
    console.log(`- Member: member@devboard.com / member123`);

    // 2. Create Project
    const project = await Project.create({
      name: 'DevBoard Platform Dev',
      description: 'Collaborative workspace for building and shipping the DevBoard project management application.',
      owner: admin._id,
      members: [admin._id, member._id],
    });

    console.log(`Sample Project created: "${project.name}"`);

    // 3. Create Tasks
    const tasks = [
      {
        title: 'Setup Authentication System',
        description: 'Implement JWT authentication, password hashing, and login/register routes on the backend.',
        status: 'Done',
        priority: 'High',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        assignee: admin._id,
        project: project._id,
      },
      {
        title: 'Design Kanban Board View',
        description: 'Implement dnd-kit drag and drop Kanban columns on the frontend. Style it with custom glassmorphic panels and slate-950 dark background.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignee: member._id,
        project: project._id,
      },
      {
        title: 'Configure Cloudinary & Multer File Uploads',
        description: 'Create route middleware to parse file streams and upload task attachments straight to Cloudinary.',
        status: 'To Do',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        assignee: admin._id,
        project: project._id,
      },
      {
        title: 'Write Test Suite & Endpoints Verification',
        description: 'Add automated route integration tests using supertest to ensure all API responses are valid.',
        status: 'To Do',
        priority: 'Low',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        assignee: member._id,
        project: project._id,
      },
    ];

    await Task.insertMany(tasks);
    console.log('Sample Tasks created successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};
