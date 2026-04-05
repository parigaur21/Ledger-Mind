const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getDashboardStats, getAnalytics, getWeeklyReport } = require('../controllers/analyticsController');

router.use(requireAuth);

router.get('/', getAnalytics);
router.get('/dashboard', getDashboardStats);
router.get('/weekly-report', getWeeklyReport);

module.exports = router;
