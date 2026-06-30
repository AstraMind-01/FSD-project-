import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { CheckCircle2, AlertTriangle, Layers, Clock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setData(data);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center text-slate-400 py-12">Failed to load dashboard statistics.</div>;

  const { summary, statusChart, priorityChart, completionChart } = data;

  const statusColors = {
    'To Do': '#38bdf8',
    'In Progress': '#fbbf24',
    'Done': '#34d399',
  };

  const priorityColors = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#ef4444',
  };

  const cards = [
    {
      title: 'Total Tasks',
      value: summary.total,
      icon: Layers,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/10',
    },
    {
      title: 'Completed',
      value: summary.completed,
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10',
    },
    {
      title: 'Pending Tasks',
      value: (summary.inProgress || 0) + (summary.todo || 0),
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/10',
    },
    {
      title: 'Overdue Tasks',
      value: summary.overdue,
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={`glass-card rounded-xl p-5 border flex items-center justify-between shadow-xl ${card.color}`}>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-100 mt-2">{card.value}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Bar Chart */}
        <div className="glass-card rounded-xl p-5 shadow-xl flex flex-col h-80">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tasks by Status</h4>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart} margin={{ bottom: 10 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="glass-card rounded-xl p-5 shadow-xl flex flex-col h-80">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tasks by Priority</h4>
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChart}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {priorityChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={priorityColors[entry.name] || '#8b5cf6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '10px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={24} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Completion Line Chart */}
        <div className="glass-card rounded-xl p-5 shadow-xl flex flex-col h-80 lg:col-span-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Task Completion History (Last 7 Days)</h4>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionChart} margin={{ left: -15, right: 10, bottom: 5 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '10px', color: '#8b5cf6' }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                  dot={{ r: 3, stroke: '#8b5cf6', strokeWidth: 1.5, fill: '#0f172a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
