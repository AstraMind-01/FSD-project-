import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as taskService from '../services/taskService';
import * as projectService from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Calendar, Paperclip, Upload, Trash2, LayoutGrid } from 'lucide-react';

const TaskDetails = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('To Do');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTaskAndMembers = async () => {
      try {
        const taskData = await taskService.getTaskById(taskId);
        setTask(taskData);

        // Load fields
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setPriority(taskData.priority);
        setDueDate(taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '');
        setAssignee(taskData.assignee ? taskData.assignee._id : '');
        setStatus(taskData.status);

        // Load project members
        const projectData = await projectService.getProjectById(projectId);
        setProjectMembers([projectData.owner, ...projectData.members]);
      } catch (err) {
        addToast('Failed to load task details', 'error');
        navigate(`/projects/${projectId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskAndMembers();
  }, [projectId, taskId]);

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isAssignee = task?.assignee && task.assignee._id === user?._id;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSubmitting(true);
    try {
      const updated = await taskService.updateTask(taskId, {
        title,
        description,
        priority,
        dueDate,
        assignee: assignee || null,
        status,
      });
      setTask(updated);
      addToast('Task updated successfully', 'success');
      navigate(`/projects/${projectId}`);
    } catch (err) {
      addToast('Failed to update task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    try {
      const updated = await taskService.updateTaskStatus(taskId, nextStatus);
      setTask(updated);
      setStatus(updated.status);
      addToast(`Status updated to ${nextStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      await taskService.deleteTask(taskId);
      addToast('Task deleted successfully', 'success');
      navigate(`/projects/${projectId}`);
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setSubmitting(true);
    try {
      const updated = await taskService.uploadAttachment(taskId, formData);
      setTask(updated);
      addToast('File uploaded successfully', 'success');
    } catch (err) {
      addToast('Upload failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isImage = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)/i) != null;
  };

  if (loading) return <LoadingSpinner />;
  if (!task) return <div className="text-center py-12 text-slate-400 font-semibold">Task not found.</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/projects/${projectId}`}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit"
        >
          <ArrowLeft size={13} />
          <span>Back to Project Board</span>
        </Link>

        {isAdmin && (
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/30 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>Delete Task</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Detail Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl">
            <h2 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <LayoutGrid size={15} className="text-indigo-400" />
              <span>Task Details</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  disabled={!isAdmin}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                  placeholder="Task details and expectations..."
                />
              </div>

              {isAdmin && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-indigo-600/20"
                  >
                    Save Modifications
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Attachments Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-3">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Paperclip size={13} className="text-indigo-400" />
                <span>Attachments ({task.attachments?.length || 0})</span>
              </h3>
              
              {(isAdmin || isAssignee) && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-400 text-[10px] font-bold rounded border border-slate-705 flex items-center gap-1 transition"
                  >
                    <Upload size={12} />
                    <span>Upload Attachment</span>
                  </button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {task.attachments?.map((file) => (
                <div key={file._id} className="p-3 rounded-lg border border-slate-800 bg-slate-900/20 flex flex-col gap-2 relative">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 flex-shrink-0">
                      <Paperclip size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold text-slate-300 hover:text-indigo-400 transition truncate block"
                        title={file.name}
                      >
                        {file.name}
                      </a>
                      <span className="text-[8px] text-slate-500 block">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {isImage(file.url) && (
                    <div className="w-full h-24 rounded bg-slate-950 overflow-hidden border border-slate-900">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
              {(!task.attachments || task.attachments.length === 0) && (
                <p className="text-[10px] text-slate-500 italic py-2 col-span-2">No attachments uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-4 p-5 rounded-xl border border-slate-800 bg-slate-900/10 h-fit">
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Task Status</span>
            {isAdmin ? (
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleStatusChange(e.target.value);
                }}
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-semibold"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  task.status === 'Done' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-amber-500' : 'bg-sky-500'
                }`} />
                <span className="text-xs font-semibold text-slate-200">{task.status}</span>
              </div>
            )}
          </div>

          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority Level</span>
            {isAdmin ? (
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-semibold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            ) : (
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                task.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' :
                task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              }`}>
                {task.priority}
              </span>
            )}
          </div>

          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</span>
            {isAdmin ? (
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-semibold"
              />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <Calendar size={12} className="text-slate-500" />
                <span>{new Date(task.dueDate).toLocaleDateString([], { dateStyle: 'medium' })}</span>
              </div>
            )}
          </div>

          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assigned Developer</span>
            {isAdmin ? (
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-semibold"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <img
                      src={task.assignee.avatar}
                      alt={task.assignee.name}
                      className="w-7 h-7 rounded-full object-cover bg-slate-800"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{task.assignee.name}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-xs italic text-slate-500">Unassigned</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
