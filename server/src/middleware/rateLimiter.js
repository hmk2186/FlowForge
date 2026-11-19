const rateLimit = require('express-rate-limit');

/**
 * Standard API rate limiter to safeguard against abuse.
 * Allows 200 requests per 15 minutes window per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
});

/**
 * Stricter auth limiter for login and registration attempts.
 * Allows 20 attempts per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again in a few minutes.',
  },
});

module.exports = { apiLimiter, authLimiter };
