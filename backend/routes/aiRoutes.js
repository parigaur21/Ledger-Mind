const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const supabase = require('../config/supabase');
const { financialAI, statementAI, storeDocumentChunks } = require('../services/aiService');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Basic AI Endpoint for Financial Questions based on DB transactions
router.post('/finance', requireAuth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "No query provided" });

        // Fetch user's transactions for context
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount, category, description, date')
            .eq('user_id', req.user.id)
            .order('date', { ascending: false })
            .limit(100);

        if (error) throw error;

        const aiResponse = await financialAI(transactions, query);
        res.json({ answer: aiResponse });

    } catch (error) {
        console.error('AI Finance Error:', error.message);
        res.status(500).json({ message: 'Server error from AI Finance endpoint' });
    }
});

// Advanced Document-based RAG Endpoint: Upload and Extract Embeddings
router.post('/finance/document/upload', requireAuth, upload.single('statement'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file provided" });
        
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);

        // Delete temporary file
        fs.unlinkSync(req.file.path);

        // Process embeddings
        const chunkCount = await storeDocumentChunks(req.user.id, data.text, req.file.originalname);
        
        res.json({ message: `Successfully stored ${chunkCount} chunks of text from the document. You can now prompt questions about it.` });

    } catch (error) {
        console.error('Upload Error:', error.message);
        res.status(500).json({ message: 'Server error parsing document' });
    }
});

// Advanced Document-based RAG Endpoint: Query
router.post('/finance/document/query', requireAuth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "No query provided" });

        const aiResponse = await statementAI(req.user.id, query);
        
        res.json({ answer: aiResponse });
    } catch (error) {
        console.error('RAG Query Error:', error.message);
        res.status(500).json({ message: 'Server error running document RAG query' });
    }
});

module.exports = router;
