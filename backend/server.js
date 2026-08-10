require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const Sentry = require('@sentry/node');
const passport = require('passport');

const connectDB = require('./config/db');
const { initRedis } = require('./config/redis');
const { initFirebase } = require('./config/firebase');
const { initCloudinary } = require('./config/cloudinary');
require('./config/passport'); // Initialize passport strategy

const { errorHandler } = require('./middleware/errorHandler.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

const { startExpirationAlertsJob } = require('./jobs/expirationAlerts.job');
const { startDailySummaryJob } = require('./jobs/dailySummary.job');
const { startWeeklyReportJob } = require('./jobs/weeklyReport.job');

const app = express();

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
  if (Sentry.Handlers && Sentry.Handlers.requestHandler) {
    app.use(Sentry.Handlers.requestHandler());
  }
}

// Global Middleware
app.use(helmet());
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (cleanOrigin === clientUrl) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(generalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/food', require('./routes/foodScan.routes'));
app.use('/api/barcode', require('./routes/barcode.routes'));
app.use('/api/nutrition', require('./routes/nutrition.routes'));
app.use('/api/diet', require('./routes/dietPlan.routes'));
app.use('/api/freshness', require('./routes/freshness.routes'));
app.use('/api/personalization', require('./routes/personalization.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/social', require('./routes/social.routes'));
app.use('/api/subscription', require('./routes/subscription.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/privacy', require('./routes/privacy.routes'));
app.use('/api/sync', require('./routes/sync.routes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Error Handling (Must be last)
if (process.env.SENTRY_DSN && Sentry.Handlers && Sentry.Handlers.errorHandler) {
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await initRedis();
    initFirebase();
    initCloudinary();

    startExpirationAlertsJob();
    startDailySummaryJob();
    startWeeklyReportJob();

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully.');
      server.close(() => {
        console.log('Process terminated.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

