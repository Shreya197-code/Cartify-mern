const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimitMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// Security Headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate Limiting on general API
app.use('/api', apiLimiter);

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive in dev if needed, or callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));

// Body parsing (Note: webhook route will use raw body if Stripe webhook is hit)
app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/payment/webhook' || req.originalUrl === '/api/payment/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoints
const healthHandler = (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Cartify API',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`
    });
};

app.get('/', (req, res) => res.send('Cartify Backend API is running'));
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Route Modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Auth routes with rate limiting
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/auth', authLimiter, authRoutes);

// Core Resource routes (v1 + backward compat alias)
app.use('/api/v1/products', productRoutes);
app.use('/api/products', productRoutes);

app.use('/api/v1/orders', orderRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/v1/payment', paymentRoutes);
app.use('/api/payment', paymentRoutes);

app.use('/api/v1/admin', analyticsRoutes);
app.use('/api/admin', analyticsRoutes);

app.use('/api/v1/ai', aiRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Cartify Backend running on port ${PORT}`);
    });
}

module.exports = app;