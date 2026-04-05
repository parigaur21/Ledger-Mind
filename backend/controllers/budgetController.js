const supabase = require('../config/supabase');

exports.getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
    const targetYear = parseInt(year) || currentDate.getFullYear();

    // 1. Fetch budgets
    const { data: budgets, error: budgetError } = await supabase
      .from('lm_budgets')
      .select('*')
      .eq('user_id', req.userId)
      .eq('month', targetMonth)
      .eq('year', targetYear);

    if (budgetError) throw budgetError;

    // 2. Calculate category-wise spending for that month
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1).toISOString();
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString();

    const { data: expenses, error: expenseError } = await supabase
      .from('lm_expenses')
      .select('category, amount')
      .eq('user_id', req.userId)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .eq('status', 'completed')
      .neq('type', 'income');

    if (expenseError) throw expenseError;

    const spendingMap = {};
    expenses.forEach(e => {
        spendingMap[e.category] = (spendingMap[e.category] || 0) + e.amount;
    });

    const budgetsWithSpending = budgets.map(b => ({
      ...b,
      spent: spendingMap[b.category] || 0,
      remaining: b.limit - (spendingMap[b.category] || 0),
      percentage: Math.round(((spendingMap[b.category] || 0) / b.limit) * 100)
    }));

    res.json({ budgets: budgetsWithSpending, month: targetMonth, year: targetYear });
  } catch (error) {
    next(error);
  }
};

exports.createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    // Upsert budget (Supabase uses ON CONFLICT natively with upsert)
    const { data: budget, error } = await supabase
      .from('lm_budgets')
      .upsert({
        user_id: req.userId,
        category,
        limit,
        month: targetMonth,
        year: targetYear,
        updated_at: new Date()
      }, { onConflict: ['user_id', 'month', 'year', 'category'] })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const { limit } = req.body;
    const { data: budget, error } = await supabase
      .from('lm_budgets')
      .update({ limit, alert_at_80: false, alert_exceeded: false, updated_at: new Date() })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error || !budget) {
      return res.status(404).json({ message: 'Budget not found.' });
    }
    res.json(budget);
  } catch (error) {
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('lm_budgets')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Budget deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
