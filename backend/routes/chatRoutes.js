const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, getInsights, clearHistory } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.post('/message', sendMessage);
router.get('/history', getHistory);
router.get('/insights', getInsights);
router.delete('/history', clearHistory);

module.exports = router;
