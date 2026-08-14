// Environment variable validation — crashes on startup with clear errors
// if required config is missing. Better to fail here than mid-request in prod.
const { cleanEnv, str, port, bool } = require('envalid');

const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
    PORT: port({ default: 5000 }),
    MONGODB_URI: str({ desc: 'MongoDB connection string' }),
    JWT_SECRET: str({ desc: 'Secret key for signing access tokens' }),
    JWT_REFRESH_SECRET: str({ desc: 'Secret key for signing refresh tokens' }),
    TMDB_API_KEY: str({ default: '' }),
    TMDB_BASE_URL: str({ default: 'https://api.themoviedb.org/3' }),
    // Comma-separated list of allowed origins, e.g. "http://localhost:5173,https://cinetrack.vercel.app"
    CLIENT_URLS: str({ default: 'http://localhost:5173' }),
    // Admin seed — NO defaults; crash on boot if missing in production
    ADMIN_USERNAME: str({ desc: 'Admin seed username' }),
    ADMIN_PASSWORD: str({ desc: 'Admin seed password' }),
    // TMDb mock mode — set to 'true' to use mock data even if TMDB_API_KEY is set
    USE_MOCK: str({ default: 'false' }),
    // Phase 3: Redis, Sentry, & Logging
    REDIS_URL: str({ default: 'redis://127.0.0.1:6379', desc: 'Redis connection URI' }),
    SENTRY_DSN: str({ default: '', desc: 'Sentry DSN for error monitoring' }),
    LOG_LEVEL: str({ choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'], default: 'info' }),
});

module.exports = env;
