import React from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

// Droppable Column Component
const KanbanColumn = ({ id, title, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const columnColors = {
    'To Do': 'border-sky-500/20 bg-sky-950/5',
    'In Progress': 'border-amber-500/20 bg-amber-950/5',
    'Done': 'border-emerald-500/20 bg-emerald-950/5',
  };

  const badgeColors = {
    'To Do': 'bg-sky-500/20 text-sky-400',
    'In Progress': 'bg-amber-500/20 text-amber-400',
    'Done': 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[260px] p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3.5 min-h-[450px] ${columnColors[id]} ${
        isOver ? 'ring-2 ring-indigo-500/30 border-indigo-500/30' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
        <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{title}</h3>
        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${badgeColors[id]}`}>
          {tasks.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-grow flex flex-col gap-3 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex-grow border border-dashed border-slate-850 rounded-xl flex items-center justify-center p-6 text-slate-650 text-[10px] italic">
            Drag tasks here
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks, onDragEnd }) => {
  const columns = [
    { id: 'To Do', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Done', title: 'Done' },
  ];

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6 items-stretch overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={colTasks}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
