const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const { period = '30' } = req.query;
        const days = parseInt(period);
        
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);

        const expenses = await Expense.find({
            user: userId,
            date: { $gte: startDate }
        });

        const totalSpent = expenses
            .filter(e => e.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const totalIncome = expenses
            .filter(e => e.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0);

        // Daily spending trend
        const mongoose = require('mongoose');
        const dailySpending = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate },
                    type: 'expense'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Category distribution
        const categoryMap = {};
        expenses.filter(e => e.type === 'expense').forEach(e => {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
        });

        const categoryDistribution = Object.keys(categoryMap).map(cat => ({
            category: cat,
            total: categoryMap[cat],
            percentage: totalSpent === 0 ? 0 : Math.round((categoryMap[cat] / totalSpent) * 100)
        }));

        // For Dashboard compatibility
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthExpenses = expenses.filter(e => e.date >= startOfMonth);
        const totalExpenses = currentMonthExpenses
            .filter(e => e.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            totalSpent,
            totalExpenses,
            totalIncome,
            dailySpending,
            categoryDistribution,
            categoryBreakdown: categoryDistribution,
            recentExpenses: expenses.sort((a,b) => b.date - a.date).slice(0, 5),
            transactionCount: expenses.length
        });
    } catch (error) {
        console.error('Error fetching analytics:', error.message);
        res.status(500).json({ message: 'Server error generating analytics' });
    }
});

// Weekly report mockup / calculation
router.get('/weekly-report', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfWeek = new Date();
        startOfWeek.setDate(now.getDate() - 7);

        const weeklyExpenses = await Expense.find({
            user: userId,
            date: { $gte: startOfWeek },
            type: 'expense'
        });

        const totalWeekly = weeklyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            weeklyTotal: totalWeekly,
            weeklyChange: -5, // Mocked for now
            topCategories: [], // Could be calculated
            insights: [
                "Your food spending is 15% lower than last week.",
                "You've reached 80% of your shopping budget."
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

module.exports = router;


