import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Search, Tv, List, BarChart2, User, Calendar,
  LogOut, ChevronLeft, ChevronRight, Film
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Tv, label: 'Library' },
  { to: '/upcoming', icon: Calendar, label: 'Upcoming' },
  { to: '/lists', icon: List, label: 'Lists' },
  { to: '/stats', icon: BarChart2, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex-shrink-0 h-screen sticky top-0 flex flex-col glass-strong border-r border-surface-border overflow-hidden z-30"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-violet flex items-center justify-center flex-shrink-0 shadow-glow-violet">
          <Film size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-bold text-white text-lg tracking-tight">CineTrack</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={20} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + collapse */}
      <div className="px-3 pb-4 space-y-2 border-t border-surface-border pt-3">
        {/* User info */}
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-violet flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
            {user?.displayName?.[0]?.toUpperCase() || 'M'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-white truncate">{user?.displayName}</p>
                <p className="text-xs text-text-muted truncate">@{user?.username}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="nav-item w-full justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
