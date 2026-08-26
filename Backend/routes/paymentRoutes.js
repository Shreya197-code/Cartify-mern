const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createCheckoutSession, handleWebhook } = require('../controllers/paymentController');

// Stripe webhook endpoint (requires raw body buffer)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected checkout session endpoint
router.post('/create-checkout-session', protect, createCheckoutSession);

module.exports = router;
