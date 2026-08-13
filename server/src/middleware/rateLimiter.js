const rateLimit = require('express-rate-limit');

// Strict limiter for auth endpoints (login, register)
// 5 attempts per 15 minutes — prevents brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,  // Return rate-limit info in RateLimit-* headers
    legacyHeaders: false,   // Disable X-RateLimit-* headers
    skipSuccessfulRequests: false,
});

// General API limiter — generous enough for normal usage, blocks abuse
// 100 requests per minute per IP
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { message: 'Too many requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
