require('dotenv').config();
const env = require('./src/config/validateEnv');
const Sentry = require('@sentry/node');

// Initialize Sentry error monitoring if SENTRY_DSN is configured
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { httpLogger, logger } = require('./src/utils/logger');

// Routes
const authRoutes = require('./src/routes/auth');
const showRoutes = require('./src/routes/shows');
const episodeRoutes = require('./src/routes/episodes');
const listRoutes = require('./src/routes/lists');
const statsRoutes = require('./src/routes/stats');
const tmdbRoutes = require('./src/routes/tmdb');
const socialRoutes = require('./src/routes/social');

const app = express();
const PORT = env.PORT;

// ── Security ─────────────────────────────────────────────
app.use(helmet());                 // Secure HTTP headers
app.use(hpp());                    // Prevent HTTP parameter pollution

// Express 5 compatible NoSQL injection sanitizer (mutates objects in-place)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// ── CORS — origins read from CLIENT_URLS env var ─────────
const allowedOrigins = env.CLIENT_URLS
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ── Rate limiting (global) ───────────────────────────────
app.use('/api', apiLimiter);

// ── Structured Logging (Pino) ─────────────────────────────
app.use(httpLogger);

// ── Health check ─────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', environment: env.NODE_ENV, timestamp: new Date().toISOString() })
);

// ── API routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/social', socialRoutes);

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Sentry Error Handler ─────────────────────────────────
if (env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ── Global error handler ─────────────────────────────────
app.use(errorHandler);

// ── Seed admin user on first startup ─────────────────────
// Credentials MUST come from env — no hardcoded fallbacks
async function seedAdminUser() {
  const User = require('./src/models/User');
  const username = env.ADMIN_USERNAME;
  const password = env.ADMIN_PASSWORD;

  const existing = await User.findOne({ username });
  if (!existing) {
    await User.create({ username, passwordHash: password, displayName: username });
    logger.info(`✅ Admin user "${username}" created`);
  }
}

// ── Start server ─────────────────────────────────────────
connectDB().then(async (conn) => {
  if (conn) {
    await seedAdminUser();
  }
  app.listen(PORT, () => {
    logger.info(`🚀 CineTrack server running on port ${PORT} [${env.NODE_ENV}]`);
    logger.info(`   CORS origins: ${allowedOrigins.join(', ')}`);
  });
});
