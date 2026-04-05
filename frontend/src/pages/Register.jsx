import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
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
        <Link to="/login" className="px-5 py-2 rounded-lg border border-dark-500/50 text-white text-sm font-semibold hover:bg-dark-700/50 transition-all">
          Sign In
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card-strong p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Create account</h1>
              <p className="text-dark-300 mt-2">Start your financial journey with AI</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Full name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    id="register-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Alex Rivera"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    id="register-email"
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
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
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

              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    id="register-confirm-password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/25 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-dark-300 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 font-medium hover:text-primary-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
