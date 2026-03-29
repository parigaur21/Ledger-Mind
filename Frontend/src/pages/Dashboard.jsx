import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, chatAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, ShoppingCart,
  AlertTriangle, Lightbulb, BarChart3, ArrowUpRight, ArrowDownRight, Download
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CATEGORY_COLORS = {
  food: '#f59e0b', transport: '#3b82f6', housing: '#8b5cf6', shopping: '#ec4899',
  entertainment: '#f97316', utilities: '#06b6d4', healthcare: '#22c55e',
  education: '#a855f7', travel: '#14b8a6', other: '#64748b'
};

const CATEGORY_ICONS = {
  food: '🍔', transport: '🚗', housing: '🏠', shopping: '🛍️',
  entertainment: '🎬', utilities: '💡', healthcare: '🏥',
  education: '📚', travel: '✈️', other: '📦'
};

const PIE_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#06b6d4', '#22d3ee', '#64748b'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashRes, insightRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        chatAPI.getInsights()
      ]);
      setStats(dashRes.data);
      setInsights(insightRes.data.insights || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const socket = getSocket();
    if (socket) {
      socket.on('expense:created', fetchData);
      socket.on('expense:updated', fetchData);
      socket.on('expense:deleted', fetchData);
      return () => {
        socket.off('expense:created', fetchData);
        socket.off('expense:updated', fetchData);
        socket.off('expense:deleted', fetchData);
      };
    }
  }, []);

  const handleDownloadInvoice = () => {
    if (!stats?.recentExpenses || stats.recentExpenses.length === 0) return;
    const doc = new jsPDF();
    doc.text("LedgerMind - Expense Invoice", 14, 20);
    const tableData = stats.recentExpenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.description,
      exp.category,
      `Rs. ${exp.amount.toFixed(2)}`
    ]);
    doc.autoTable({
      startY: 30,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: tableData,
    });
    doc.save("LedgerMind_Invoice.pdf");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-64 loading-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 loading-skeleton" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 loading-skeleton" />
          <div className="h-80 loading-skeleton" />
        </div>
      </div>
    );
  }

  const netBalance = (stats?.totalIncome || 0) - (stats?.totalExpenses || 0);
  const statCards = [
    {
      label: 'Monthly Spending',
      value: `₹${(stats?.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      change: stats?.monthlyChange || 0,
      icon: TrendingDown,
      gradient: 'from-rose-500 to-rose-400'
    },
    {
      label: 'Monthly Income',
      value: `₹${(stats?.totalIncome || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-400'
    },
    {
      label: 'Net Balance',
      value: `₹${netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: 'from-primary-600 to-primary-400'
    },
    {
      label: 'Transactions',
      value: stats?.transactionCount || 0,
      sublabel: 'This month',
      icon: CreditCard,
      gradient: 'from-accent-500 to-accent-400'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-dark-300 text-sm mt-1">Here's what's happening with your finances today.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 rounded-xl border border-accent-500/30 text-accent-500 text-sm font-semibold hover:bg-accent-500/10 transition-colors shadow-lg flex items-center gap-2"
          >
            <Download size={16} /> Download Invoice
          </button>
          <button
            onClick={() => navigate('/expenses')}
            className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/20"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="glass-card p-5 hover:border-primary-500/20 transition-all duration-300 group"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-dark-300 uppercase tracking-wider font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                {card.change !== undefined && card.change !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${card.change > 0 ? 'text-danger' : 'text-success'}`}>
                    {card.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{Math.abs(card.change).toFixed(1)}%</span>
                    <span className="text-dark-400 ml-1">vs last month</span>
                  </div>
                )}
                {card.sublabel && (
                  <p className="text-xs text-dark-400 mt-2">{card.sublabel}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${card.gradient} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Monthly Spending</h2>
            <span className="text-xs text-dark-400 px-3 py-1 rounded-lg bg-dark-700/50 border border-dark-600/50">
              Last 6 Months
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.monthlyTrend || []} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#151d2e', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 12, color: '#fff' }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Spending']}
              />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Category Breakdown</h2>
          {stats?.categoryBreakdown?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={0}
                  >
                    {stats.categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151d2e', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 12, color: '#fff' }}
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-4 mb-4">
                <p className="text-2xl font-bold text-white">₹{(stats?.totalExpenses || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-dark-400 uppercase tracking-wider">Total Spent</p>
              </div>
              <div className="space-y-2">
                {stats.categoryBreakdown.slice(0, 4).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-dark-200 capitalize">{cat.category}</span>
                    </div>
                    <span className="text-white font-medium">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-dark-400">
              <BarChart3 size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No expenses yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    insight.type === 'budget'
                      ? 'bg-danger/5 border-danger/20'
                      : insight.type === 'spending'
                      ? 'bg-warning/5 border-warning/20'
                      : 'bg-primary-500/5 border-primary-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{insight.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{insight.title}</p>
                      <p className="text-xs text-dark-300 mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">Spending Insight</p>
                    <p className="text-xs text-dark-300 mt-1">Add some expenses to get personalized insights.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">Smart Saving Tip</p>
                    <p className="text-xs text-dark-300 mt-1">Start tracking expenses to receive AI-powered savings recommendations.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <button onClick={() => navigate('/expenses')} className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium">
              View All
            </button>
          </div>
          {stats?.recentExpenses?.length > 0 ? (
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-4 px-4 py-2 text-[10px] text-dark-400 uppercase tracking-widest font-semibold">
                <span>Transaction</span>
                <span>Category</span>
                <span>Date</span>
                <span className="text-right">Amount</span>
              </div>
              {stats.recentExpenses.map((exp, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 rounded-xl hover:bg-dark-700/30 transition-colors items-center border-b border-dark-600/20 last:border-0 border-t-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{CATEGORY_ICONS[exp.category] || '📦'}</span>
                    <span className="text-sm text-white truncate">{exp.description}</span>
                  </div>
                  <span className="text-sm text-dark-300 capitalize">{exp.category}</span>
                  <span className="text-sm text-dark-300">{new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-base text-white font-extrabold tracking-tight text-right">-₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-dark-400">
              <CreditCard size={36} className="mb-3 opacity-30" />
              <p className="text-sm">No transactions yet</p>
              <button
                onClick={() => navigate('/expenses')}
                className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Add your first expense →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
