const supabase = require('../config/supabase');

exports.getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search, sort, page = 1, limit = 20, type } = req.query;
    
    let query = supabase
      .from('lm_expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (search) {
      query = query.ilike('description', `%${search}%`);
    }

    const sortField = 'date';
    const sortOrder = sort === 'oldest' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data: expenses, count: total, error } = await query;
    if (error) throw error;

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
    const { data: expense, error } = await supabase
      .from('lm_expenses')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (error || !expense) {
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
    
    const { data: expense, error } = await supabase
      .from('lm_expenses')
      .insert([{
        user_id: req.userId,
        amount,
        category,
        description,
        type: type || 'expense',
        date: date || new Date().toISOString(),
        status: status || 'completed',
        source: 'manual'
      }])
      .select()
      .single();

    if (error) throw error;

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
    const { data: expense, error } = await supabase
      .from('lm_expenses')
      .update({ amount, category, description, date, status, type, updated_at: new Date() })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error || !expense) {
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
    const { data: expense, error } = await supabase
      .from('lm_expenses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;

    const io = req.app.get('io');
    if (io) {
      io.to(req.userId.toString()).emit('expense:deleted', { id: req.params.id });
    }

    res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
