require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { clerkMiddleware } = require('@clerk/express');

const connectDB = require('./config/db.js');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware.js');

// Routes Imports
const transactionRoutes = require('./routes/transactionRoutes.js');
const csvRoutes = require('./routes/csvRoutes.js');
const budgetRoutes = require('./routes/budgetRoutes.js');
const insightRoutes = require('./routes/insightRoutes.js');

// Connect to database
connectDB();

const app = express();

// --- Middleware Order is Critical ---
// 1. CORS first – allows preflight OPTIONS requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));

// 2. Parse JSON bodies BEFORE Clerk so the body is available
app.use(express.json());

// 3. Clerk middleware – reads the Authorization header and attaches auth to req
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

// 4. Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Routes
app.use('/api/transactions/csv', csvRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/insights', insightRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  const { getAuth } = require('@clerk/express');
  const auth = getAuth(req);
  res.status(200).json({ 
    status: 'OK', 
    message: 'FlowAI API Running',
    authPresent: !!auth?.userId,
  });
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 FlowAI API running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`   Clerk Key: ${process.env.CLERK_PUBLISHABLE_KEY?.slice(0, 20)}...`);
});
