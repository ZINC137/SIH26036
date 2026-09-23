const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Check for token in cookies
    const token = req.cookies.sessionId;

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

module.exports = { authMiddleware };
