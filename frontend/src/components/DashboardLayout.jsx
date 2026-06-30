import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Analytics Dashboard';
    if (path === '/projects') return 'Developer Projects';
    if (path.startsWith('/projects/')) return 'Project Workspace';
    if (path === '/profile') return 'My Developer Profile';
    return 'DevBoard';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <Navbar title={getTitle()} />
        <main className="flex-grow pt-16 p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
