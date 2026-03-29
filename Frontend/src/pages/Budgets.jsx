import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import { Plus, X, Trash2, Target, TrendingUp } from 'lucide-react';

const CATEGORIES = ['food', 'transport', 'housing', 'shopping', 'entertainment', 'utilities', 'healthcare', 'education', 'travel', 'other'];
const CATEGORY_ICONS = {
  food: '🍔', transport: '🚗', housing: '🏠', shopping: '🛍️',
  entertainment: '🎬', utilities: '💡', healthcare: '🏥',
  education: '📚', travel: '✈️', other: '📦'
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'food', limit: '' });
  const [submitting, setSubmitting] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetAPI.getAll({ month, year });
      setBudgets(res.data.budgets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await budgetAPI.create({ ...form, limit: parseFloat(form.limit), month, year });
      setShowModal(false);
      setForm({ category: 'food', limit: '' });
      fetchBudgets();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await budgetAPI.delete(id);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget Planner</h1>
          <p className="text-dark-300 text-sm mt-1">Set and track monthly spending limits per category.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/20"
          >
            <Plus size={18} />
            Set Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-dark-400 uppercase tracking-wider font-medium">Total Budget</p>
          <p className="text-2xl font-bold text-white mt-2">₹{totalBudget.toLocaleString('en-IN')}</p>
          <p className="text-xs text-dark-300 mt-1">{budgets.length} active budgets</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-dark-400 uppercase tracking-wider font-medium">Total Spent</p>
          <p className="text-2xl font-bold text-white mt-2">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className={`text-xs mt-1 ${overallPct >= 100 ? 'text-danger' : overallPct >= 80 ? 'text-warning' : 'text-success'}`}>
            {overallPct}% of total budget
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-dark-400 uppercase tracking-wider font-medium">Remaining</p>
          <p className="text-2xl font-bold text-white mt-2">₹{Math.max(totalBudget - totalSpent, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ${overallPct >= 100 ? 'bg-danger' : overallPct >= 80 ? 'bg-warning' : 'bg-primary-500'}`}
              style={{ width: `${Math.min(overallPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-36 loading-skeleton" />)}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const pct = budget.percentage;
            const barColor = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-primary-500';
            const statusColor = pct >= 100 ? 'text-danger' : pct >= 80 ? 'text-warning' : 'text-success';
            return (
              <div key={budget._id} className="glass-card p-5 hover:border-primary-500/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_ICONS[budget.category] || '📦'}</span>
                    <div>
                      <h3 className="text-base font-semibold text-white capitalize">{budget.category}</h3>
                      <p className="text-xs text-dark-400">Monthly limit: ₹{budget.limit.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(budget._id)} className="p-1 text-dark-400 hover:text-danger transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <span className="text-sm text-white font-medium">₹{budget.spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className={`text-xs font-medium ${statusColor}`}>{pct}%</span>
                </div>
                <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-dark-400">Remaining: ₹{budget.remaining > 0 ? budget.remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</span>
                  {pct >= 80 && pct < 100 && <span className="text-xs text-warning">⚠️ Almost exceeded</span>}
                  {pct >= 100 && <span className="text-xs text-danger">🚨 Budget exceeded</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <Target size={48} className="text-dark-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No budgets set</h3>
          <p className="text-sm text-dark-400 max-w-sm">Set monthly budgets for your categories to track spending and get alerts when you're close to the limit.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Create Your First Budget
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md glass-card-strong p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Set Budget</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-600/50 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Monthly Limit (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  placeholder="Enter budget amount"
                  required
                  className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-dark-500/50 text-dark-200 hover:text-white hover:border-dark-400 transition-all text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary-500/20">
                  {submitting ? 'Saving...' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
