const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDashboardActivity,
  getDashboardCharts,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);
router.get('/charts', getDashboardCharts);

module.exports = router;
