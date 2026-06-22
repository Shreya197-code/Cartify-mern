const express = require('express');
const router = express.Router();

const {
  getDashboardAnalytics
} = require('../controllers/analyticsController.js');

router.get('/dashboard', getDashboardAnalytics);

module.exports = router;