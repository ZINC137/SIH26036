const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header
    let token = req.cookies?.sessionId;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No session token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = decoded;
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

