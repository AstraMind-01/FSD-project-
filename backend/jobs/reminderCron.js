import cron from 'node-cron';
import Task from '../models/Task.js';
import { sendEmail } from '../services/emailService.js';

export const startReminderCron = () => {
  // '0 8 * * *' runs daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily task reminder cron job...');
    try {
      const today = new Date();
      const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const tasksDueTomorrow = await Task.find({
        dueDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
        status: { $ne: 'Done' },
        assignee: { $ne: null },
      })
        .populate('assignee', 'name email')
        .populate('project', 'name');

      console.log(`Found ${tasksDueTomorrow.length} tasks due tomorrow.`);

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

      for (const task of tasksDueTomorrow) {
        if (!task.assignee || !task.assignee.email) continue;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Task Due Reminder</h2>
            <p>Hello <strong>${task.assignee.name}</strong>,</p>
            <p>You have a task due tomorrow in project <strong>${task.project.name}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Task:</strong> ${task.title}</p>
              <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="font-weight: bold; color: ${task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981'};">${task.priority}</span></p>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
            
            <p style="margin-bottom: 20px;">Please update the task status on the project board once completed.</p>
            
            <a href="${clientUrl}/projects/${task.project._id}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Project Board</a>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
            <p style="font-size: 12px; color: #64748b;">This is an automated reminder from DevBoard. Please do not reply directly to this email.</p>
          </div>
        `;

        await sendEmail({
          to: task.assignee.email,
          subject: `Urgent Reminder: Task "${task.title}" is due tomorrow`,
          html: emailHtml,
        });
      }
    } catch (error) {
      console.error('Error running task reminder cron job:', error);
    }
  });
};
