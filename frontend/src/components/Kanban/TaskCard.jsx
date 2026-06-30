import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Paperclip, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: 'grab',
  };

  const priorityColors = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';

  const handleClick = (e) => {
    // Avoid routing if dragged
    if (transform) return;
    const pId = task.project._id || task.project;
    navigate(`/projects/${pId}/tasks/${task._id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="p-3.5 rounded-xl glass-card border border-slate-800/80 hover:border-slate-700/80 transition shadow-md select-none group"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {isOverdue && (
          <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-400">
            <AlertCircle size={10} />
            <span>Overdue</span>
          </span>
        )}
      </div>

      <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition leading-snug line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer Info */}
      <div className="border-t border-slate-850 pt-3 mt-3.5 flex items-center justify-between text-slate-500 text-[10px]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-0.5">
              <Paperclip size={11} />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {task.assignee ? (
          <img
            src={task.assignee.avatar}
            title={task.assignee.name}
            alt={task.assignee.name}
            className="w-5.5 h-5.5 rounded-full object-cover bg-slate-800 border border-slate-750"
          />
        ) : (
          <div className="w-5.5 h-5.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500" title="Unassigned">
            U
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
