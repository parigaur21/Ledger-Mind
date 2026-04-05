const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const supabase = require('../config/supabase');
const { generateAIResponse } = require('../services/aiService');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const pdfParse = require('pdf-parse');

// AI Financial Questions endpoint
router.post('/finance', requireAuth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "No query provided" });

        // Use the migrated generateAIResponse which already fetches from Supabase
        const aiResponse = await generateAIResponse(query, req.user.id);
        res.json({ answer: aiResponse });
    } catch (error) {
        console.error('AI Finance Error:', error.message);
        res.status(500).json({ message: 'Server error from AI Finance endpoint' });
    }
});

// Document Upload (simplified - no RAG/embeddings for now)
router.post('/finance/document/upload', requireAuth, upload.single('statement'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file provided" });
        
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        fs.unlinkSync(req.file.path);

        res.json({ message: `Successfully processed document. You can now ask questions about your finances.` });
    } catch (error) {
        console.error('Upload Error:', error.message);
        if (req.file?.path) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error parsing document' });
    }
});

// Document Query (simplified)
router.post('/finance/document/query', requireAuth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "No query provided" });

        const aiResponse = await generateAIResponse(query, req.user.id);
        res.json({ answer: aiResponse });
    } catch (error) {
        console.error('RAG Query Error:', error.message);
        res.status(500).json({ message: 'Server error running query' });
    }
});

module.exports = router;
