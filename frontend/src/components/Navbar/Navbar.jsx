import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellOff, Sun, Moon } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-850/80 glass flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20">
      {/* Title */}
      <h1 className="text-md font-bold text-slate-100 tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
        {title}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full border border-slate-800/80 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-950 transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full border border-slate-800/80 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-950 transition-all relative"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-indigo-600 text-[9px] text-white font-bold flex items-center justify-center border border-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl border border-slate-800/80 shadow-2xl overflow-hidden z-50 animate-slide-in">
              <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
                <span className="text-xs font-bold text-slate-300">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 flex flex-col items-center gap-1.5">
                    <BellOff size={20} className="text-slate-600" />
                    <p className="text-[11px]">All caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && markAsRead(n._id)}
                      className={`p-3 text-[11px] leading-normal transition cursor-pointer ${
                        n.read ? 'text-slate-400 hover:bg-slate-800/20' : 'text-slate-200 bg-indigo-950/5 hover:bg-indigo-950/10 font-medium'
                      } flex gap-2.5 items-start`}
                    >
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0 animate-pulse" />
                      )}
                      <div className="flex-1">
                        <p>{n.message}</p>
                        <span className="text-[9px] text-slate-500 block mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 border-l border-slate-800/80 pl-4 h-8">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline-block">{user.name}</span>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full border border-slate-700 bg-slate-800 object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
