import { useState, useEffect } from 'react';
import { expenseAPI, statementAPI } from '../services/api';
import { getSocket } from '../services/socket';
import {
  Plus, Search, Edit3, Trash2, X, Filter, ChevronLeft, ChevronRight, Download, FileText

} from 'lucide-react';

const CATEGORIES = ['all', 'food', 'transport', 'housing', 'shopping', 'entertainment', 'utilities', 'healthcare', 'education', 'travel', 'salary', 'freelance', 'investment', 'gift', 'other'];
const CATEGORY_ICONS = {
  food: '🍔', transport: '🚗', housing: '🏠', shopping: '🛍️',
  entertainment: '🎬', utilities: '💡', healthcare: '🏥',
  education: '📚', travel: '✈️', salary: '💸', freelance: '💻',
  investment: '📈', gift: '🎁', other: '📦'
};
const CATEGORY_COLORS = {
  food: 'text-amber-400', transport: 'text-blue-400', housing: 'text-purple-400',
  shopping: 'text-pink-400', entertainment: 'text-orange-400', utilities: 'text-cyan-400',
  healthcare: 'text-green-400', education: 'text-violet-400', travel: 'text-teal-400',
  salary: 'text-emerald-400', freelance: 'text-emerald-300', investment: 'text-emerald-500', 
  gift: 'text-rose-400', other: 'text-slate-400'
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10, sort };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data.expenses);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [category, sort]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('expense:created', () => fetchExpenses(pagination.page));
      socket.on('expense:updated', () => fetchExpenses(pagination.page));
      socket.on('expense:deleted', () => fetchExpenses(pagination.page));
      return () => {
        socket.off('expense:created');
        socket.off('expense:updated');
        socket.off('expense:deleted');
      };
    }
  }, [pagination.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExpenses(1);
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setForm({ type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setForm({
      type: exp.type || 'expense',
      amount: exp.amount.toString(),
      category: exp.category,
      description: exp.description,
      date: new Date(exp.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (editingExpense) {
        await expenseAPI.update(editingExpense._id, data);
      } else {
        await expenseAPI.create(data);
      }
      setShowModal(false);
      fetchExpenses(pagination.page);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseAPI.delete(id);
      fetchExpenses(pagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  const exportToCSV = () => {
    if (!expenses.length) return;
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString('en-IN'),
      exp.type || 'expense',
      exp.category,
      `"${exp.description.replace(/"/g, '""')}"`,
      exp.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LedgerMind_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <div className="flex gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dark-600/50 text-dark-200 hover:text-white hover:border-dark-400 hover:bg-dark-700/50 transition-all text-sm font-semibold">
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.csv,.txt"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                  setLoading(true);
                  const res = await statementAPI.upload(file);
                  alert(res.data.message);
                  fetchExpenses(1);
                } catch (err) {
                  alert(err.response?.data?.message || 'Upload failed');
                } finally {
                  setLoading(false);
                }
              }}
            />
            <FileText size={18} className="text-accent-500" />
            Import Statement
          </label>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dark-600/50 text-dark-200 hover:text-white hover:border-dark-400 hover:bg-dark-700/50 transition-all text-sm font-semibold"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            id="add-expense-btn"
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/20"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>

      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              category === cat
                ? 'gradient-primary text-white shadow-md shadow-primary-500/20'
                : 'bg-dark-700/50 text-dark-300 border border-dark-600/50 hover:text-white hover:border-dark-400'
            }`}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-48 pl-9 pr-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
            />
          </form>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-xl text-sm text-dark-200 focus:outline-none focus:border-primary-500/50 transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 border-b border-dark-600/30 text-xs text-dark-400 uppercase tracking-wider font-medium">
          <span>Date</span>
          <span>Category</span>
          <span>Description</span>
          <span className="text-right tracking-widest font-semibold text-[10px]">Amount</span>
          <span className="text-right tracking-widest font-semibold text-[10px]">Actions</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 loading-skeleton" />)}
          </div>
        ) : expenses.length > 0 ? (
          <div className="divide-y divide-dark-600/20">
            {expenses.map((exp) => (
              <div key={exp._id} className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-6 py-4 hover:bg-dark-700/20 transition-colors items-center">
                <div className="text-sm">
                  <span className="text-white">{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-dark-500 block text-xs">{new Date(exp.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[exp.category] || '📦'}</span>
                  <span className={`text-sm font-medium capitalize ${CATEGORY_COLORS[exp.category] || 'text-dark-200'}`}>{exp.category}</span>
                </div>
                <div className="text-sm text-dark-200 truncate">{exp.description}</div>
                <div className={`text-base font-extrabold tracking-tight text-right ${exp.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                  {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${exp.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {exp.status}
                  </span>
                  <button onClick={() => openEditModal(exp)} className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-dark-600/50 transition-all">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => handleDelete(exp._id)} className="p-1.5 rounded-lg text-dark-400 hover:text-danger hover:bg-dark-600/50 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-dark-400">
            <Filter size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No expenses found</p>
            <button onClick={openAddModal} className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Add your first expense →
            </button>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-600/30">
            <p className="text-xs text-dark-400">
              Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchExpenses(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-dark-600/50 text-sm text-dark-300 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchExpenses(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 rounded-lg border border-dark-600/50 text-sm text-dark-300 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md glass-card-strong p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingExpense ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-600/50 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4 mb-4">
                <label className="flex-1 relative cursor-pointer group">
                  <input type="radio" name="type" className="sr-only" checked={form.type === 'expense'} onChange={() => setForm({...form, type: 'expense'})} />
                  <div className={`text-center py-2 px-4 rounded-xl text-sm font-medium transition-all ${form.type === 'expense' ? 'bg-danger/20 text-danger border border-danger/50' : 'bg-dark-700/50 text-dark-300 border border-transparent hover:bg-dark-600/50'}`}>Expense</div>
                </label>
                <label className="flex-1 relative cursor-pointer group">
                  <input type="radio" name="type" className="sr-only" checked={form.type === 'income'} onChange={() => setForm({...form, type: 'income'})} />
                  <div className={`text-center py-2 px-4 rounded-xl text-sm font-medium transition-all ${form.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-dark-700/50 text-dark-300 border border-transparent hover:bg-dark-600/50'}`}>Income</div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                >
                  {CATEGORIES.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={form.type === 'income' ? 'Salary, Freelance, Gift...' : 'What was this expense for?'}
                  required
                  className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-dark-500/50 text-dark-200 hover:text-white hover:border-dark-400 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary-500/20"
                >
                  {submitting ? 'Saving...' : editingExpense ? 'Update' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
