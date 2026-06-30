import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get dashboard analytics metrics and charts data
// @route   GET /api/dashboard/summary
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    let projectFilter = {};

    if (req.user.role !== 'Admin') {
      const userProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      projectFilter = { project: { $in: projectIds } };
    }

    const now = new Date();

    const stats = await Task.aggregate([
      { $match: projectFilter },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] }
                },
                inProgress: {
                  $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
                },
                todo: {
                  $sum: { $cond: [{ $eq: ['$status', 'To Do'] }, 1, 0] }
                },
                overdue: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$status', 'Done'] },
                          { $lt: ['$dueDate', now] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          priorityCounts: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ],
          completedLast7Days: [
            {
              $match: {
                status: 'Done',
                updatedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    const summaryData = stats[0].summary[0] || { total: 0, completed: 0, inProgress: 0, todo: 0, overdue: 0 };
    const statusCounts = stats[0].statusCounts || [];
    const priorityCounts = stats[0].priorityCounts || [];
    const completedLast7Days = stats[0].completedLast7Days || [];

    const statusMap = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    statusCounts.forEach(s => {
      if (s._id in statusMap) statusMap[s._id] = s.count;
    });
    const formattedStatuses = Object.keys(statusMap).map(key => ({ name: key, count: statusMap[key] }));

    const priorityMap = { 'Low': 0, 'Medium': 0, 'High': 0 };
    priorityCounts.forEach(p => {
      if (p._id in priorityMap) priorityMap[p._id] = p.count;
    });
    const formattedPriorities = Object.keys(priorityMap).map(key => ({ name: key, count: priorityMap[key] }));

    const last7DaysList = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const match = completedLast7Days.find(item => item._id === dateString);
      last7DaysList.push({
        date: dateString,
        completed: match ? match.count : 0
      });
    }

    res.json({
      summary: {
        total: summaryData.total || 0,
        completed: summaryData.completed || 0,
        inProgress: summaryData.inProgress || 0,
        todo: summaryData.todo || 0,
        overdue: summaryData.overdue || 0
      },
      statusChart: formattedStatuses,
      priorityChart: formattedPriorities,
      completionChart: last7DaysList
    });
  } catch (error) {
    next(error);
  }
};
