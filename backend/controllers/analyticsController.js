const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      monthlyTotal,
      monthlyIncome,
      lastMonthTotal,
      weeklyTotal,
      categoryBreakdown,
      recentExpenses,
      monthlyTrend,
      budgets
    ] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth }, status: 'completed', type: { $ne: 'income' } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth }, status: 'completed', type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: 'completed', type: { $ne: 'income' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfWeek }, status: 'completed', type: { $ne: 'income' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth }, status: 'completed', type: { $ne: 'income' } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Expense.find({ user: userId }).sort({ date: -1 }).limit(5),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: new Date(now.getFullYear(), 0, 1) }, status: 'completed', type: { $ne: 'income' } } },
        {
          $group: {
            _id: { month: { $month: '$date' }, year: { $year: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Budget.find({ user: userId, month: now.getMonth() + 1, year: now.getFullYear() })
    ]);

    const currentMonthTotal = monthlyTotal[0]?.total || 0;
    const totalIncome = monthlyIncome[0]?.total || 0;
    const prevMonthTotal = lastMonthTotal[0]?.total || 0;
    const monthlyChange = prevMonthTotal > 0
      ? (((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100).toFixed(1)
      : 0;

    const totalSpent = currentMonthTotal;
    const categoryData = categoryBreakdown.map(c => ({
      category: c._id,
      total: c.total,
      count: c.count,
      percentage: totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0
    }));

    const budgetAlerts = [];
    const categorySpendMap = {};
    categoryBreakdown.forEach(c => { categorySpendMap[c._id] = c.total; });

    budgets.forEach(b => {
      const spent = categorySpendMap[b.category] || 0;
      const pct = (spent / b.limit) * 100;
      if (pct >= 100) {
        budgetAlerts.push({
          type: 'exceeded',
          category: b.category,
          limit: b.limit,
          spent,
          percentage: Math.round(pct)
        });
      } else if (pct >= 80) {
        budgetAlerts.push({
          type: 'warning',
          category: b.category,
          limit: b.limit,
          spent,
          percentage: Math.round(pct)
        });
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = months.map((name, i) => {
      const found = monthlyTrend.find(m => m._id.month === i + 1);
      return { month: name, total: found ? found.total : 0 };
    });

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const avgDailySpend = daysPassed > 0 ? (currentMonthTotal / daysPassed).toFixed(2) : 0;

    res.json({
      totalExpenses: currentMonthTotal,
      totalIncome: totalIncome,
      netBalance: totalIncome - currentMonthTotal,
      monthlyChange: parseFloat(monthlyChange),
      weeklyTotal: weeklyTotal[0]?.total || 0,
      transactionCount: monthlyTotal[0]?.count || 0,
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
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);

    const [categoryDist, weeklyComparison, dailySpending] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startDate }, status: 'completed' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) }, status: 'completed' } },
        {
          $group: {
            _id: {
              week: { $ceil: { $divide: [{ $subtract: [now, '$date'] }, 7 * 24 * 60 * 60 * 1000] } },
              dayOfWeek: { $dayOfWeek: '$date' }
            },
            total: { $sum: '$amount' }
          }
        }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startDate }, status: 'completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalSpent = categoryDist.reduce((sum, c) => sum + c.total, 0);

    res.json({
      categoryDistribution: categoryDist.map(c => ({
        category: c._id,
        total: c.total,
        count: c.count,
        percentage: totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0
      })),
      weeklyComparison,
      dailySpending,
      totalSpent,
      period: daysAgo
    });
  } catch (error) {
    next(error);
  }
};

exports.getWeeklyReport = async (req, res, next) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [thisWeek, lastWeek, categoryBreakdown] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: weekAgo }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: twoWeeksAgo, $lt: weekAgo }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: weekAgo }, status: 'completed' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ])
    ]);

    const thisWeekTotal = thisWeek[0]?.total || 0;
    const lastWeekTotal = lastWeek[0]?.total || 0;
    const change = lastWeekTotal > 0
      ? (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(1)
      : 0;

    const insights = [];
    if (thisWeekTotal > lastWeekTotal && lastWeekTotal > 0) {
      insights.push(`Your spending increased by ${Math.abs(change)}% compared to last week.`);
    } else if (thisWeekTotal < lastWeekTotal) {
      insights.push(`Great job! You reduced spending by ${Math.abs(change)}% compared to last week.`);
    }

    if (categoryBreakdown.length > 0) {
      insights.push(`Your top spending category was ${categoryBreakdown[0]._id} at $${categoryBreakdown[0].total.toFixed(2)}.`);
    }

    res.json({
      totalSpending: thisWeekTotal,
      transactionCount: thisWeek[0]?.count || 0,
      weeklyChange: parseFloat(change),
      topCategories: categoryBreakdown.slice(0, 5),
      insights
    });
  } catch (error) {
    next(error);
  }
};
