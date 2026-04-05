import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-dark-600/30">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <path d="M8 12h24M8 20h16M8 28h20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-white">LedgerMind</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-dark-300 hidden sm:block">Support</span>
          <Link to="/register" className="px-5 py-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Sign Up
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card-strong p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Welcome back</h1>
              <p className="text-dark-300 mt-2">Log in to your AI financial copilot</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Password</label>
                  <button type="button" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-600/50"></div></div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-dark-700 text-dark-400 uppercase tracking-wider">or continue with</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark-500/50 text-dark-200 hover:text-white hover:border-dark-400 transition-all text-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark-500/50 text-dark-200 hover:text-white hover:border-dark-400 transition-all text-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  Apple
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-dark-300 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 font-medium hover:text-primary-300 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center py-6 border-t border-dark-600/20">
        <div className="flex items-center justify-center gap-6 text-xs text-dark-400 mb-2">
          <span className="hover:text-dark-200 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-dark-200 cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-dark-200 cursor-pointer transition-colors">Contact</span>
        </div>
        <p className="text-xs text-dark-500">© 2026 LedgerMind AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
