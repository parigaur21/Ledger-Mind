const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount, category, date')
            .eq('user_id', req.user.id);

        if (error) throw error;

        let totalSpend = 0;
        const categoryTotals = {};

        transactions.forEach((txn) => {
            const amount = Number(txn.amount);
            totalSpend += amount;

            if (categoryTotals[txn.category]) {
                categoryTotals[txn.category] += amount;
            } else {
                categoryTotals[txn.category] = amount;
            }
        });

        res.json({
            totalSpend,
            categoryTotals
        });
    } catch (error) {
        console.error('Error fetching analytics:', error.message);
        res.status(500).json({ message: 'Server error generating analytics' });
    }
});

module.exports = router;
