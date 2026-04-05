const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

exports.getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
    const targetYear = parseInt(year) || currentDate.getFullYear();

    const budgets = await Budget.find({
      user: req.userId,
      month: targetMonth,
      year: targetYear
    });

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const mongoose = require('mongoose');
    const spending = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const spendingMap = {};
    spending.forEach(s => { spendingMap[s._id] = s.total; });

    const budgetsWithSpending = budgets.map(b => ({
      ...b.toObject(),
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

    const existing = await Budget.findOne({
      user: req.userId,
      category,
      month: targetMonth,
      year: targetYear
    });

    if (existing) {
      existing.limit = limit;
      existing.alertAt80 = false;
      existing.alertExceeded = false;
      await existing.save();
      return res.json(existing);
    }

    const budget = await Budget.create({
      user: req.userId,
      category,
      limit,
      month: targetMonth,
      year: targetYear
    });

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const { limit } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { limit, alertAt80: false, alertExceeded: false },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found.' });
    }
    res.json(budget);
  } catch (error) {
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found.' });
    }
    res.json({ message: 'Budget deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
