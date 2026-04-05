import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import {
  DollarSign, TrendingUp, Target, PieChart as PieIcon
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#06b6d4', '#22d3ee', '#f59e0b', '#22c55e', '#ec4899'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, reportRes] = await Promise.all([
        analyticsAPI.getAnalytics({ period }),
        analyticsAPI.getWeeklyReport()
      ]);
      setData(analyticsRes.data);
      setReport(reportRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 loading-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 loading-skeleton" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 loading-skeleton" />
          <div className="h-80 loading-skeleton" />
        </div>
      </div>
    );
  }

  const statsCards = [
    { label: 'Total Expenses', value: `₹${(data?.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, change: report?.weeklyChange, icon: DollarSign },
    { label: 'Active Budgets', value: '12', sublabel: 'On track', icon: Target },
    { label: 'Avg Daily Spend', value: `₹${((data?.totalSpent || 0) / Math.max(parseInt(period), 1)).toFixed(2)}`, change: 8, icon: TrendingUp },
    { label: 'Savings Rate', value: '24.5%', change: 2, icon: PieIcon }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-dark-300 text-sm mt-1">Real-time breakdown of your spending and fiscal efficiency.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('30')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === '30' ? 'gradient-primary text-white shadow-md' : 'bg-dark-700/50 text-dark-300 border border-dark-600/50 hover:text-white'}`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setPeriod('90')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === '90' ? 'gradient-primary text-white shadow-md' : 'bg-dark-700/50 text-dark-300 border border-dark-600/50 hover:text-white'}`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setPeriod('365')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === '365' ? 'gradient-primary text-white shadow-md' : 'bg-dark-700/50 text-dark-300 border border-dark-600/50 hover:text-white'}`}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <div key={i} className="glass-card p-5">
            <p className="text-xs text-dark-400 uppercase tracking-wider font-medium">{card.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-white">{card.value}</p>
              {card.change !== undefined && (
                <span className={`text-xs font-medium ${card.change > 0 ? 'text-danger' : 'text-success'}`}>
                  ~{Math.abs(card.change).toFixed(0)}%
                </span>
              )}
              {card.sublabel && <span className="text-xs text-dark-400">{card.sublabel}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-lg font-semibold text-white">Monthly Spending Trend</h2>
              <p className="text-xs text-dark-400 mt-1">Historical data for the current fiscal year</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-500" /> Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-dark-400" /> Target</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.dailySpending || []}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#151d2e', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 12, color: '#fff' }} formatter={(v) => [`₹${v.toFixed(2)}`, 'Spending']} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', stroke: '#151d2e', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Category Distribution</h2>
            <p className="text-xs text-dark-400 mt-1">Allocation by expense type</p>
          </div>
          {data?.categoryDistribution?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    strokeWidth={0}
                  >
                    {data.categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#151d2e', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 12, color: '#fff' }} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-2 mb-4">
                <p className="text-xl font-bold text-white">75%</p>
                <p className="text-xs text-dark-400 uppercase">Budget Used</p>
              </div>
              <div className="space-y-2.5">
                {data.categoryDistribution.slice(0, 5).map((cat, i) => (
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
              <PieIcon size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Weekly Comparison</h2>
            <p className="text-xs text-dark-400 mt-1">Performance vs last week</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { day: 'Mon', thisWeek: 120, lastWeek: 80 },
              { day: 'Tue', thisWeek: 200, lastWeek: 150 },
              { day: 'Wed', thisWeek: 80, lastWeek: 180 },
              { day: 'Thu', thisWeek: 300, lastWeek: 120 },
              { day: 'Fri', thisWeek: 250, lastWeek: 200 },
              { day: 'Sat', thisWeek: 180, lastWeek: 90 },
              { day: 'Sun', thisWeek: 100, lastWeek: 60 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#151d2e', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="thisWeek" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} name="This Week" />
              <Bar dataKey="lastWeek" fill="#334155" radius={[4, 4, 0, 0]} barSize={16} name="Last Week" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Budget Performance</h2>
            <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium">View All</button>
          </div>
          <div className="space-y-5">
            {(report?.topCategories || []).length > 0 ? (
              report.topCategories.slice(0, 4).map((cat, i) => {
                const limit = cat.total * 1.3;
                const pct = Math.min(Math.round((cat.total / limit) * 100), 100);
                const barColor = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-primary-500';
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white font-medium capitalize">{cat._id}</span>
                      <span className="text-xs text-dark-300">₹{cat.total.toLocaleString('en-IN')} / ₹{Math.round(limit).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-dark-400">
                <Target size={36} className="mb-3 opacity-30" />
                <p className="text-sm">No budget data yet</p>
              </div>
            )}
          </div>

          {report?.insights?.length > 0 && (
            <div className="mt-6 pt-5 border-t border-dark-600/30 space-y-3">
              <h3 className="text-sm font-semibold text-white">Weekly Insights</h3>
              {report.insights.map((insight, i) => (
                <p key={i} className="text-xs text-dark-300 leading-relaxed">💡 {insight}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
