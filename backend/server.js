require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { clerkMiddleware } = require('@clerk/express');

// Database
const connectDB = require('./config/db.js');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware.js');

// Routes
const transactionRoutes = require('./routes/transactionRoutes.js');
const csvRoutes = require('./routes/csvRoutes.js');
const budgetRoutes = require('./routes/budgetRoutes.js');
const insightRoutes = require('./routes/insightRoutes.js');

connectDB();

const app = express();

// Trust proxy (for Render)
app.set('trust proxy', 1);

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Clerk middleware
app.use(clerkMiddleware());

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

// Health check
app.get('/api/health', (req, res) => {
  const { getAuth } = require('@clerk/express');
  const auth = getAuth(req);

  res.status(200).json({
    status: 'OK',
    message: 'FlowAI API Running',
    userId: auth?.userId || null,
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FlowAI API running on port ${PORT}`);
});