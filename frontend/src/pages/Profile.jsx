import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Shield, Briefcase, Calendar, CheckSquare } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        const { data: projects } = await api.get('/projects');
        let allTasks = [];
        for (const project of projects) {
          const { data: tasks } = await api.get(`/tasks/project/${project._id}`);
          const filtered = tasks.filter(t => t.assignee && t.assignee._id === user._id);
          allTasks = [...allTasks, ...filtered];
        }
        setAssignedTasks(allTasks);
      } catch (err) {
        console.error('Error fetching user tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchUserTasks();
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-xl object-cover bg-slate-900"
          />
          <span className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-4 border-slate-950" />
        </div>

        <div className="flex-grow space-y-4 text-center md:text-left">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">{user.name}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-2">
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                user.role?.toLowerCase() === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              }`}>
                <Shield size={10} />
                <span>{user.role}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                <Mail size={10} />
                <span>{user.email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-5 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Tasks</p>
            <h3 className="text-xl font-extrabold text-slate-100 mt-1">{assignedTasks.length}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            <Briefcase size={16} />
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">In Progress</p>
            <h3 className="text-xl font-extrabold text-slate-100 mt-1">
              {assignedTasks.filter(t => t.status !== 'Done').length}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/15">
            <Calendar size={16} />
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
            <h3 className="text-xl font-extrabold text-slate-100 mt-1">
              {assignedTasks.filter(t => t.status === 'Done').length}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
            <CheckSquare size={16} />
          </div>
        </div>
      </div>

      {/* Assigned Tasks Table */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-2xl">
        <h3 className="text-xs font-bold text-slate-200 mb-4 uppercase tracking-widest">My Workspace Tasks</h3>
        {assignedTasks.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">You have no tasks assigned currently.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2">Task Title</th>
                  <th className="py-2">Project</th>
                  <th className="py-2">Priority</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Due Date</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-850">
                {assignedTasks.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-900/10 transition">
                    <td className="py-3 font-semibold text-slate-200">{t.title}</td>
                    <td className="py-3 text-slate-400">{t.project.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                        t.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-semibold">{t.status}</td>
                    <td className="py-3 text-slate-400">{new Date(t.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
