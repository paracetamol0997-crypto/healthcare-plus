const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'health_companion_secret_key_2026';

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // If no token provided, check if user requested demo session or return 401
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: 'Authentication server error' });
  }
}

// Optional middleware that loads user if token exists, but doesn't block if missing
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.getUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // ignore token error for optional auth
    }
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuth,
  JWT_SECRET
};
