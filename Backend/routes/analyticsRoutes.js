const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');
const { admin } = require('../middleware/adminMiddleware.js');

const {
  getDashboardAnalytics
} = require('../controllers/analyticsController.js');

router.get('/dashboard', protect, admin, getDashboardAnalytics);

module.exports = router;