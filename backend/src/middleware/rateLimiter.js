const rateLimit = require('express-rate-limit');

// Rate Limiter for Authentication Routes
// NOTE: Limit is relaxed for development. Tighten for production.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 200, // 10 in prod, 200 in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts, please try again later.'
  },
});

module.exports = { authRateLimiter };
