import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as projectService from '../services/projectService';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Plus, FolderKanban, Trash2, Edit, X, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Projects = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const { projects, fetchProjects, loading, setProjects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditMode(false);
    setSelectedProject(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditMode(true);
    setSelectedProject(project);
    setName(project.name);
    setDescription(project.description);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const data = await projectService.updateProject(selectedProject._id, name, description);
        setProjects(projects.map((p) => (p._id === data._id ? data : p)));
        addToast('Project updated successfully', 'success');
      } else {
        const data = await projectService.createProject(name, description);
        setProjects([data, ...projects]);
        addToast('Project created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save project', 'error');
    }
  };

  const handleDelete = async (id, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"?`)) return;
    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
      addToast('Project deleted', 'success');
    } catch (err) {
      addToast('Failed to delete project', 'error');
    }
  };

  if (loading && projects.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-wide">Developer Projects</h2>
          <p className="text-xs text-slate-400 mt-1">Manage and access your project boards</p>
        </div>
        {user?.role?.toLowerCase() === 'admin' && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="glass rounded-xl p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
          <FolderKanban size={48} className="text-slate-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-300">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {user?.role?.toLowerCase() === 'admin'
                ? 'Get started by creating your first workspace project.'
                : "You aren't member of any projects yet."}
            </p>
          </div>
          {user?.role?.toLowerCase() === 'admin' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-indigo-400 font-semibold rounded-lg text-xs transition border border-slate-700/50"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="glass-card rounded-xl p-5 flex flex-col justify-between border border-slate-800 hover:border-indigo-950/40 transition duration-300 relative group">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition truncate">
                    {project.name}
                  </h3>
                  
                  {user?.role?.toLowerCase() === 'admin' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-250">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id, project.name)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-normal mt-2 line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div className="border-t border-slate-850 pt-4 mt-6 flex items-center justify-between">
                {/* Team Members */}
                <div className="flex -space-x-1.5 overflow-hidden">
                  <img
                    src={project.owner.avatar}
                    title={`Owner: ${project.owner.name}`}
                    alt={project.owner.name}
                    className="w-5.5 h-5.5 rounded-full border-2 border-slate-900 object-cover bg-slate-800"
                  />
                  {project.members.slice(0, 3).map((m) => (
                    <img
                      key={m._id}
                      src={m.avatar}
                      title={m.name}
                      alt={m.name}
                      className="w-5.5 h-5.5 rounded-full border-2 border-slate-900 object-cover bg-slate-800"
                    />
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-5.5 h-5.5 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[7px] font-bold text-slate-400">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 group/btn"
                >
                  <span>Workspace</span>
                  <ArrowRight size={13} className="transform group-hover/btn:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition"
            >
              <X size={16} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 mb-5">
              {editMode ? 'Edit Project' : 'Create New Project'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  placeholder="e.g. Mobile App Redesign"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs resize-none"
                  placeholder="Summarize the project scope, goals, and specs..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow-lg shadow-indigo-600/10"
              >
                {editMode ? 'Update Project' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
