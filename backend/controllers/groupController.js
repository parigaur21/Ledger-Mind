const Group = require('../models/Group');
const SharedExpense = require('../models/SharedExpense');
const User = require('../models/User');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      createdBy: req.userId,
      members: [{ user: req.userId }]
    });
    
    // Populate member details before returning
    await group.populate('members.user', 'name email avatar');
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ 'members.user': req.userId })
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findOne({ inviteCode });
    if (!group) return res.status(404).json({ message: 'Invalid invite code' });

    const isMember = group.members.some(m => m.user.toString() === req.userId);
    if (!isMember) {
      group.members.push({ user: req.userId });
      await group.save();
    }
    
    await group.populate('members.user', 'name email avatar');
    res.json(group);
  } catch (error) {
    next(error);
  }
};

exports.getGroupDetails = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email avatar');
      
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const expenses = await SharedExpense.find({ group: req.params.id })
      .populate('paidBy', 'name avatar')
      .populate('splits.user', 'name avatar')
      .sort({ date: -1 });

    // Calculate balances
    const balances = {};
    group.members.forEach(m => {
      balances[m.user._id.toString()] = { user: m.user, netBalance: 0 };
    });

    expenses.forEach(exp => {
      const paidById = exp.paidBy._id.toString();
      if (balances[paidById]) balances[paidById].netBalance += exp.amount;

      exp.splits.forEach(split => {
        const splitUserId = split.user._id ? split.user._id.toString() : split.user.toString();
        if (balances[splitUserId]) {
          balances[splitUserId].netBalance -= split.amount;
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
      if (minAmount > 0.01) {
        settlements.push({
          from: debtor.user,
          to: creditor.user,
          amount: parseFloat(minAmount.toFixed(2))
        });
      }
      
      debtor.amount -= minAmount;
      creditor.amount -= minAmount;
      
      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }

    res.json({
      group,
      expenses,
      balances: Object.values(balances),
      settlements
    });
  } catch (error) {
    next(error);
  }
};

exports.addSharedExpense = async (req, res, next) => {
  try {
    const { amount, description, category, splits } = req.body;
    const expense = await SharedExpense.create({
      group: req.params.id,
      paidBy: req.userId,
      amount,
      description,
      category,
      splits
    });
    
    await expense.populate('paidBy', 'name avatar');
    await expense.populate('splits.user', 'name avatar');

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};
