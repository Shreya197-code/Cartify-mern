const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { optionalProtect } = require('../middleware/optionalAuthMiddleware');
const {
    semanticSearch,
    assistantChat,
    generateDescription,
    getReviewSummary
} = require('../controllers/aiController');

// Semantic product search (hybrid AI/keyword)
router.get('/search', semanticSearch);
router.post('/search', semanticSearch);

// Grounded shopping assistant chat
router.post('/chat', optionalProtect, assistantChat);

// Admin description generator (human-in-the-loop)
router.post('/generate-description', protect, admin, generateDescription);

// Review sentiment & pros/cons summary
router.get('/review-summary/:productId', getReviewSummary);

module.exports = router;
