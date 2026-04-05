const supabase = require('../config/supabase');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 1. Create group
    const { data: group, error: gError } = await supabase
      .from('lm_groups')
      .insert([{ name, description, created_by: req.userId, invite_code: inviteCode }])
      .select()
      .single();

    if (gError) throw gError;

    // 2. Add creator as member
    const { error: mError } = await supabase
      .from('lm_group_members')
      .insert([{ group_id: group.id, user_id: req.userId }]);

    if (mError) throw mError;

    // 3. Populate and return
    const { data: finalGroup } = await supabase
      .from('lm_groups')
      .select('*, members:lm_group_members(user:lm_users(id, name, email, avatar))')
      .eq('id', group.id)
      .single();

    res.status(201).json(finalGroup);
  } catch (error) {
    next(error);
  }
};

exports.getGroups = async (req, res, next) => {
  try {
    const { data: groups, error } = await supabase
      .from('lm_groups')
      .select('*, members:lm_group_members(user:lm_users(id, name, email, avatar))')
      .eq('lm_group_members.user_id', req.userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const { data: group, error: gError } = await supabase
      .from('lm_groups')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (gError || !group) return res.status(404).json({ message: 'Invalid invite code' });

    // Join
    const { error: mError } = await supabase
      .from('lm_group_members')
      .upsert([{ group_id: group.id, user_id: req.userId }]);

    if (mError) throw mError;

    const { data: finalGroup } = await supabase
      .from('lm_groups')
      .select('*, members:lm_group_members(user:lm_users(id, name, email, avatar))')
      .eq('id', group.id)
      .single();

    res.json(finalGroup);
  } catch (error) {
    next(error);
  }
};

exports.getGroupDetails = async (req, res, next) => {
  try {
    const groupId = req.params.id;

    // 1. Group info
    const { data: group, error: ge } = await supabase
      .from('lm_groups')
      .select('*, members:lm_group_members(user:lm_users(id, name, email, avatar))')
      .eq('id', groupId)
      .single();
    if (ge || !group) return res.status(404).json({ message: 'Group not found' });

    // 2. Shared Expenses
    const { data: expenses, error: expe } = await supabase
      .from('lm_shared_expenses')
      .select('*, paidBy:lm_users!lm_shared_expenses_paid_by_fkey(id, name, avatar), splits:lm_shared_expense_splits(user:lm_users(id, name, avatar), amount)')
      .eq('group_id', groupId)
      .order('date', { ascending: false });
    if (expe) throw expe;

    // 3. Balance Calculations
    const balances = {};
    group.members.forEach(m => {
      balances[m.user.id] = { user: m.user, netBalance: 0 };
    });

    expenses.forEach(exp => {
      const paidById = exp.paidBy.id;
      if (balances[paidById]) balances[paidById].netBalance += parseFloat(exp.amount);

      exp.splits.forEach(split => {
        const splitUserId = split.user.id;
        if (balances[splitUserId]) {
          balances[splitUserId].netBalance -= parseFloat(split.amount);
        }
      });
    });

    const debtors = [];
    const creditors = [];
    Object.values(balances).forEach(b => {
      if (b.netBalance < -0.01) debtors.push({ user: b.user, amount: Math.abs(b.netBalance) });
      else if (b.netBalance > 0.01) creditors.push({ user: b.user, amount: b.netBalance });
    });

    debtors.sort((a,b) => b.amount - a.amount);
    creditors.sort((a,b) => b.amount - a.amount);

    const settlements = [];
    let d = 0, c = 0;
    while(d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      const minAmount = Math.min(debtor.amount, creditor.amount);
      if (minAmount > 0.01) { settlements.push({ from: debtor.user, to: creditor.user, amount: parseFloat(minAmount.toFixed(2)) }); }
      debtor.amount -= minAmount;
      creditor.amount -= minAmount;
      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }

    res.json({ group, expenses, balances: Object.values(balances), settlements });
  } catch (error) {
    next(error);
  }
};

exports.addSharedExpense = async (req, res, next) => {
  try {
    const { amount, description, category, splits } = req.body;
    const groupId = req.params.id;

    // 1. Expense
    const { data: expense, error: eError } = await supabase
      .from('lm_shared_expenses')
      .insert([{ group_id: groupId, paid_by: req.userId, amount, description, category }])
      .select()
      .single();

    if (eError) throw eError;

    // 2. Splits
    const splitData = splits.map(s => ({
        shared_expense_id: expense.id,
        user_id: s.user_id || s.user, // check both formats
        amount: s.amount
    }));

    const { error: sError } = await supabase.from('lm_shared_expense_splits').insert(splitData);
    if (sError) throw sError;

    // 3. Return populated
    const { data: finalExpense } = await supabase
      .from('lm_shared_expenses')
      .select('*, paidBy:lm_users!lm_shared_expenses_paid_by_fkey(id, name, avatar), splits:lm_shared_expense_splits(user:lm_users(id, name, avatar), amount)')
      .eq('id', expense.id)
      .single();

    res.status(201).json(finalExpense);
  } catch (error) {
    next(error);
  }
};
