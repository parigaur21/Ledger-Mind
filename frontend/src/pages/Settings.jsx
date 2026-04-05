import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Globe, Shield, Bell, Palette, Save, Check } from 'lucide-react';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'USD'
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('ledgermind_theme') || 'default');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ledgermind_theme', theme);
  }, [theme]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-300 text-sm mt-1">Manage your account preferences and configuration.</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary-500/20">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
            <p className="text-sm text-dark-300">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 font-medium capitalize">
              {user?.plan || 'Free'} Plan
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-primary-400" />
            Profile Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-600/30 rounded-xl text-dark-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Globe size={18} className="text-primary-400" />
            Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
              >
                <option value="default">Dark (Default)</option>
                <option value="light">Light Mode</option>
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="emerald">Emerald Nature</option>
                <option value="dracula">Dracula</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Bell size={18} className="text-primary-400" />
            Notifications
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Budget alerts', desc: 'Notify when 80% or 100% of budget is reached', checked: true },
              { label: 'Weekly reports', desc: 'Receive automated weekly spending summaries', checked: true },
              { label: 'AI insights', desc: 'Get personalized financial tips and recommendations', checked: true },
              { label: 'Expense reminders', desc: 'Daily reminder to log expenses', checked: false }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-dark-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                  <div className="w-10 h-5 bg-dark-600 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={logout}
            className="px-5 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all text-sm font-medium"
          >
            Sign Out
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary-500/20"
          >
            {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
