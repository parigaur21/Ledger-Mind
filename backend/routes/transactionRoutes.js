const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// Get all transactions for a user
router.get('/', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('date', { ascending: false });


        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ message: 'Server error fetching transactions' });
    }
});

// Add a transaction
router.post('/', requireAuth, async (req, res) => {
    try {
        const { amount, category, description, date } = req.body;
        
        if (!amount || !category || !date) {
            return res.status(400).json({ message: 'Please provide amount, category, and date.' });
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert([
                {
                    user_id: req.user.id,
                    amount,
                    category,
                    description,
                    date
                }
            ])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error adding transaction:', error.message);
        res.status(500).json({ message: 'Server error adding transaction' });
    }
});

module.exports = router;
