require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/auth');
const showRoutes = require('./src/routes/shows');
const episodeRoutes = require('./src/routes/episodes');
const listRoutes = require('./src/routes/lists');
const statsRoutes = require('./src/routes/stats');
const tmdbRoutes = require('./src/routes/tmdb');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

// CORS — allow client dev + production
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'https://cinetrack.vercel.app', // Update with your Vercel URL
    ],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Logging (only in dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tmdb', tmdbRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Seed admin user on first startup
async function seedAdminUser() {
  const User = require('./src/models/User');
  const username = process.env.ADMIN_USERNAME || 'midun';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';

  const existing = await User.findOne({ username });
  if (!existing) {
    await User.create({ username, passwordHash: password, displayName: 'Midun' });
    console.log(`✅ Admin user "${username}" created`);
  }
}

// Start server
connectDB().then(async () => {
  await seedAdminUser();
  app.listen(PORT, () => {
    console.log(`🚀 CineTrack server running on port ${PORT}`);
  });
});
