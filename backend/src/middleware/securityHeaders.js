/**
 * HTTP Security Headers Middleware
 * Implements defense-in-depth security headers per OWASP guidelines:
 * - Content-Security-Policy (CSP)
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: SAMEORIGIN (clickjacking protection)
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy
 * - HSTS in production
 */

const securityHeaders = (req, res, next) => {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking defense
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Disable buggy legacy XSS auditor in modern browsers
  res.setHeader('X-XSS-Protection', '0');

  // Strict Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (restrict device sensors / APIs)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' ${process.env.BACKEND_URL || 'http://localhost:5001'} ${process.env.FRONTEND_URL || 'http://localhost:3000'} ws://localhost:3000; frame-ancestors 'self';`
  );

  // Strict Transport Security (HSTS) in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Defend against browser history and cache exposure on API endpoints (OWASP Recommendation)
  if (req.path && req.path.startsWith('/api') && !req.path.startsWith('/api/rules/categories')) {
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

module.exports = { securityHeaders };
