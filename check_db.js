const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Expense = mongoose.model('Expense', new mongoose.Schema({}, { strict: false }));
    
    const userCount = await User.countDocuments();
    const expenseCount = await Expense.countDocuments();
    
    console.log('User count:', userCount);
    console.log('Expense count:', expenseCount);
    
    const allExpenses = await Expense.find().lean();
    console.log('All Expenses in DB:', JSON.stringify(allExpenses, null, 2));

    const allBudgets = await mongoose.model('Budget', new mongoose.Schema({}, { strict: false })).find().lean();
    console.log('All Budgets in DB:', JSON.stringify(allBudgets, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
