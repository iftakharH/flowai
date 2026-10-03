require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Database
const connectDB = require('./config/db.js');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware.js');

// Routes
const authRoutes = require('./routes/authRoutes.js');
const transactionRoutes = require('./routes/transactionRoutes.js');
const csvRoutes = require('./routes/csvRoutes.js');
const budgetRoutes = require('./routes/budgetRoutes.js');
const insightRoutes = require('./routes/insightRoutes.js');
const settingsRoutes = require('./routes/settingsRoutes.js');
const billingRoutes = require('./routes/billingRoutes.js');
const { handleWebhook } = require('./controllers/billingController.js');
const smartRoutes = require('./routes/smartRoutes.js');
const goalRoutes = require('./routes/goalRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const quoteRoutes = require('./routes/quoteRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const accountRoutes = require('./routes/accountRoutes.js');

const app = express();

// Connect DB
connectDB();

// Trust proxy
app.set('trust proxy', 1);

// CORS: only the origins below are allowed to talk to this API.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://flowai-purple.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser clients (curl, health checks, server-to-server).
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const err = new Error('Origin not allowed by CORS');
      err.status = 403;
      callback(err);
    }
  },
  credentials: true,
}));

// Stripe signs the raw request body. This must be mounted before express.json().
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Body parser
app.use(express.json({ limit: '10mb' }));

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api', limiter);

// Routes
app.use('/api/transactions/csv', csvRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/smart', smartRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/accounts', accountRoutes);

// Backward-compatible route aliases for clients missing the /api prefix.
app.use('/insights', insightRoutes);
app.use('/auth', authRoutes);
app.use('/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FlowAI API Running',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FlowAI API running on port ${PORT}`);
});
