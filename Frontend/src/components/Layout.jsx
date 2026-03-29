import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Receipt, BarChart3, MessageSquare,
  Wallet, Settings, LogOut, Bell, Search, Menu, X, ChevronDown, Users,
  Sun, Moon
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/budgets', label: 'Budgets', icon: Wallet },
  { path: '/groups', label: 'Groups', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('finchat_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('finchat_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <div
        className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-800/90 backdrop-blur-xl border-r border-dark-600/50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-600/50">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12h24M8 20h16M8 28h20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">LedgerMind</h1>
            <p className="text-xs text-dark-300">AI Financial Copilot</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-dark-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 shadow-lg shadow-primary-500/5'
                    : 'text-dark-200 hover:text-white hover:bg-dark-700/50'
                }`
              }
            >
              <Icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
              <span>{label}</span>
              {label === 'AI Chat' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-600/50">
          <div className="glass-card p-4 mb-3">
            <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider">Pro Plan</p>
            <p className="text-xs text-dark-300 mt-1">Unlimited AI insights & analytics</p>
            <button className="w-full mt-3 py-2 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              Upgrade Now
            </button>
          </div>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-dark-900">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-dark-300 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-0">
        <header className="h-16 bg-dark-800/60 backdrop-blur-xl border-b border-dark-600/50 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-dark-200 hover:text-white p-1">
              <Menu size={22} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search transactions, reports..."
                className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="relative p-2 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative p-2 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-dark-700/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-dark-900">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-white">{user?.name || 'User'}</span>
                <ChevronDown size={14} className="text-dark-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 glass-card-strong py-2 shadow-xl z-50 animate-fade-in">
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-dark-200 hover:text-white hover:bg-dark-600/50 transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <hr className="my-1 border-dark-600/50" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-dark-600/50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
