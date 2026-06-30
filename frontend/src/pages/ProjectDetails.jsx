import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';
import * as authService from '../services/authService';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Plus, ArrowLeft, X } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const { currentProject, tasks, selectProject, setTasks, setCurrentProject, loading } = useProjects();

  // Members invitation state
  const [allUsers, setAllUsers] = useState([]);
  const [inviteUserId, setInviteUserId] = useState('');

  // Task creation state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const fetchCandidates = async () => {
    try {
      if (user?.role?.toLowerCase() === 'admin') {
        const users = await authService.getMembers();
        setAllUsers(users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    selectProject(id);
    fetchCandidates();
  }, [id]);

  // Drag and Drop Handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const nextStatus = over.id; // column ID: 'To Do', 'In Progress', 'Done'

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === nextStatus) return;

    const prevStatus = task.status;
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      await taskService.updateTaskStatus(taskId, nextStatus);
      addToast(`Task moved to ${nextStatus}`, 'success');
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: prevStatus } : t))
      );
      addToast('Failed to update task status', 'error');
    }
  };

  // Create Task
  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await taskService.createTask({
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate,
        assignee: taskAssignee || null,
        projectId: id,
      });

      setTasks([data, ...tasks]);
      addToast('Task created successfully', 'success');
      
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('Medium');
      setTaskDueDate('');
      setTaskAssignee('');
      setIsCreateTaskOpen(false);
    } catch (err) {
      addToast('Failed to create task', 'error');
    }
  };

  // Invite member
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteUserId) return;
    try {
      const data = await projectService.inviteMember(id, inviteUserId);
      setCurrentProject(data);
      setInviteUserId('');
      addToast('Member invited to project', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to invite member', 'error');
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId, name) => {
    if (!window.confirm(`Remove "${name}" from this project?`)) return;
    try {
      const data = await projectService.removeMember(id, memberId);
      setCurrentProject(data);
      addToast('Member removed from project', 'success');
    } catch (err) {
      addToast('Failed to remove member', 'error');
    }
  };

  if (loading && !currentProject) return <LoadingSpinner />;
  if (!currentProject) return <div className="text-center py-12 text-slate-400">Project not found.</div>;

  const inviteCandidates = allUsers.filter(
    (u) =>
      u._id !== currentProject.owner._id &&
      !currentProject.members.some((m) => m._id === u._id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/projects"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit"
          >
            <ArrowLeft size={13} />
            <span>All Projects</span>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{currentProject.name}</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">{currentProject.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Plus size={15} />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Board */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <div className="xl:col-span-3">
          <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} />
        </div>

        {/* Team Sidebar */}
        <div className="space-y-6 xl:col-span-1">
          <div className="glass-card rounded-xl p-4 border border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3.5 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Users size={12} className="text-indigo-400" />
              <span>Project Team</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-3.5">
              {/* Project Owner */}
              <div className="flex items-center gap-2.5">
                <img
                  src={currentProject.owner.avatar}
                  alt={currentProject.owner.name}
                  className="w-6.5 h-6.5 rounded-full object-cover bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{currentProject.owner.name}</p>
                  <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider">Project Owner</p>
                </div>
              </div>

              {/* Members */}
              {currentProject.members.map((m) => (
                <div key={m._id} className="flex items-center justify-between gap-2.5 group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-6.5 h-6.5 rounded-full object-cover bg-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{m.name}</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">{m.role}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveMember(m._id, m.name)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition duration-150"
                      title="Remove member"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}

              {currentProject.members.length === 0 && (
                <p className="text-[9px] text-slate-500 italic">No members added yet.</p>
              )}
            </div>

            {/* Invite Panel */}
            {isAdmin && inviteCandidates.length > 0 && (
              <form onSubmit={handleInviteMember} className="border-t border-slate-850 pt-3.5 flex gap-2">
                <select
                  required
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg glass-input text-[10px] appearance-none"
                >
                  <option value="" className="bg-slate-900 text-slate-500 font-semibold">Select developer...</option>
                  {inviteCandidates.map((c) => (
                    <option key={c._id} value={c._id} className="bg-slate-900 text-white font-semibold">
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[9px] font-bold text-white transition flex-shrink-0"
                >
                  Add
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsCreateTaskOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition"
            >
              <X size={16} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 mb-5">Create Task</h3>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  placeholder="e.g. Implement JWT session cookie"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs resize-none"
                  placeholder="Describe task objectives..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assignee</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                >
                  <option value="" className="bg-slate-900 text-slate-500 font-semibold">Unassigned</option>
                  <option value={currentProject.owner._id} className="bg-slate-900 text-white font-semibold">{currentProject.owner.name} (Owner)</option>
                  {currentProject.members.map((m) => (
                    <option key={m._id} value={m._id} className="bg-slate-900 text-white font-semibold">{m.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
