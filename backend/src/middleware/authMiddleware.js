const jwt = require('jsonwebtoken');
const { isTokenRevoked, isUserRevoked } = require('../services/sessionService');

const authMiddleware = (req, res, next) => {
  try {
    // Check for token in cookies, Authorization header, or query param
    let token = req.cookies?.sessionId;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token && req.query?.token) {
      token = req.query.token;
    }

    // Enforce strict Cache-Control on all authenticated requests and auth responses
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No session token provided' });
    }

    // 1. Verify token is not in server-side revocation list (e.g. logged out)
    if (isTokenRevoked(token)) {
      return res.status(401).json({
        error: 'Unauthorized: Session has been logged out or revoked',
        code: 'SESSION_REVOKED',
      });
    }

    // 2. Cryptographic signature and expiry verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Verify user's sessions have not been collectively revoked (e.g. administrative suspension)
    if (isUserRevoked(decoded.id, decoded.iat)) {
      return res.status(401).json({
        error: 'Unauthorized: User session revoked',
        code: 'SESSION_REVOKED',
      });
    }

    // 4. Attach authenticated user and token reference to request
    req.user = decoded;
    req.token = token;

    // 5. Enforce strict Cache-Control on all authenticated API responses
    // Prevents browser back-forward cache (bfcache) or intermediate caches from storing sensitive data
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted to [${roles.join(', ')}] roles` });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };

