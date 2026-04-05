const supabase = require('../config/supabase');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // 1. Fetch current month expenses & income
    const { data: currentMonthExpenses, error: e1 } = await supabase
      .from('lm_expenses')
      .select('amount, type, category')
      .eq('user_id', userId)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .eq('status', 'completed');

    // 2. Last month total
    const { data: lastMonthExpenses, error: e2 } = await supabase
      .from('lm_expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startOfLastMonth)
      .lte('date', endOfLastMonth)
      .eq('status', 'completed')
      .neq('type', 'income');

    // 3. Weekly total
    const { data: weeklyExpenses, error: e3 } = await supabase
      .from('lm_expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startOfWeek.toISOString())
      .eq('status', 'completed')
      .neq('type', 'income');

    // 4. Recent expenses
    const { data: recentExpenses, error: e4 } = await supabase
      .from('lm_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    // 5. Budgets
    const { data: budgets, error: e5 } = await supabase
      .from('lm_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', now.getMonth() + 1)
      .eq('year', now.getFullYear());

    if (e1 || e2 || e3 || e4 || e5) throw (e1 || e2 || e3 || e4 || e5);

    // -- PROCESS CALCULATIONS --
    let currentMonthTotal = 0;
    let totalIncome = 0;
    const categoryBreakdown = {};
    let transactionCount = 0;

    currentMonthExpenses.forEach(exp => {
      if (exp.type === 'income') {
        totalIncome += exp.amount;
      } else {
        currentMonthTotal += exp.amount;
        categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
        transactionCount++;
      }
    });

    const prevMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const weeklyTotal = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const monthlyChange = prevMonthTotal > 0
      ? (((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100).toFixed(1)
      : 0;

    const categoryData = Object.entries(categoryBreakdown).map(([cat, total]) => ({
      category: cat,
      total,
      percentage: currentMonthTotal > 0 ? Math.round((total / currentMonthTotal) * 100) : 0
    })).sort((a,b) => b.total - a.total);

    const budgetAlerts = [];
    budgets.forEach(b => {
      const spent = categoryBreakdown[b.category] || 0;
      const pct = (spent / b.limit) * 100;
      if (pct >= 100) {
        budgetAlerts.push({ type: 'exceeded', category: b.category, limit: b.limit, spent, percentage: Math.round(pct) });
      } else if (pct >= 80) {
        budgetAlerts.push({ type: 'warning', category: b.category, limit: b.limit, spent, percentage: Math.round(pct) });
      }
    });

    // Trend calculation for year
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
    const { data: yearExpenses } = await supabase
      .from('lm_expenses')
      .select('amount, date')
      .eq('user_id', userId)
      .gte('date', startOfYear)
      .eq('status', 'completed')
      .neq('type', 'income');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = Array(12).fill(0);
    yearExpenses?.forEach(e => {
        const d = new Date(e.date);
        trendMap[d.getMonth()] += e.amount;
    });

    const trendData = months.map((name, i) => ({ month: name, total: trendMap[i] }));

    const daysPassed = now.getDate();
    const avgDailySpend = daysPassed > 0 ? (currentMonthTotal / daysPassed).toFixed(2) : 0;

    res.json({
      totalExpenses: currentMonthTotal,
      totalIncome: totalIncome,
      netBalance: totalIncome - currentMonthTotal,
      monthlyChange: parseFloat(monthlyChange),
      weeklyTotal,
      transactionCount,
      avgDailySpend: parseFloat(avgDailySpend),
      categoryBreakdown: categoryData,
      recentExpenses,
      monthlyTrend: trendData,
      budgetAlerts,
      savingsRate: 24.5
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const { data: expenses, error } = await supabase
      .from('lm_expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .eq('status', 'completed');

    if (error) throw error;

    const categoryDist = {};
    const dailySpending = {};
    let totalSpent = 0;

    expenses.forEach(e => {
      if (e.type !== 'income') {
        totalSpent += e.amount;
        categoryDist[e.category] = (categoryDist[e.category] || 0) + e.amount;
        const dateStr = new Date(e.date).toISOString().split('T')[0];
        dailySpending[dateStr] = (dailySpending[dateStr] || 0) + e.amount;
      }
    });

    const categoryData = Object.entries(categoryDist).map(([cat, total]) => ({
      category: cat,
      total,
      percentage: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0
    })).sort((a,b) => b.total - a.total);

    const dailyData = Object.entries(dailySpending).map(([date, total]) => ({ _id: date, total }));

    res.json({
      categoryDistribution: categoryData,
      dailySpending: dailyData,
      totalSpent,
      period: daysAgo
    });
  } catch (error) {
    next(error);
  }
};

exports.getWeeklyReport = async (req, res, next) => {
    // Similarly simplified for Supabase
    try {
        const userId = req.userId;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

        const { data: expenses, error } = await supabase
            .from('lm_expenses')
            .select('*')
            .eq('user_id', userId)
            .gte('date', twoWeeksAgo)
            .eq('status', 'completed');

        if (error) throw error;

        let thisWeekTotal = 0;
        let lastWeekTotal = 0;
        const categoryDist = {};

        expenses.forEach(e => {
            if (e.type !== 'income') {
                if (e.date >= weekAgo) {
                    thisWeekTotal += e.amount;
                    categoryDist[e.category] = (categoryDist[e.category] || 0) + e.amount;
                } else {
                    lastWeekTotal += e.amount;
                }
            }
        });

        const change = lastWeekTotal > 0
            ? (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(1)
            : 0;

        const sortedCategories = Object.entries(categoryDist)
            .map(([cat, total]) => ({ _id: cat, total }))
            .sort((a,b) => b.total - a.total);

        res.json({
            totalSpending: thisWeekTotal,
            weeklyChange: parseFloat(change),
            topCategories: sortedCategories.slice(0, 5),
            insights: [`Your spending changed by ${change}% this week.`]
        });
    } catch (error) {
        next(error);
    }
};
