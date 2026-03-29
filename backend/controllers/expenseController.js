const Expense = require('../models/Expense');

exports.getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search, sort, page = 1, limit = 20, type } = req.query;
    const query = { user: req.userId };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const sortOption = sort === 'oldest' ? { date: 1 } : { date: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(query)
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
    res.json(expense);
  } catch (error) {
    next(error);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date, status, type } = req.body;
    const expense = await Expense.create({
      user: req.userId,
      amount,
      category,
      description,
      type: type || 'expense',
      date: date || Date.now(),
      status: status || 'completed',
      source: 'manual'
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.userId.toString()).emit('expense:created', expense);
    }

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date, status, type } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { amount, category, description, date, status, type },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(req.userId.toString()).emit('expense:updated', expense);
    }

    res.json(expense);
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(req.userId.toString()).emit('expense:deleted', { id: req.params.id });
    }

    res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
