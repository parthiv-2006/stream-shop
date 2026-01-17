const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT token
 * Attaches user to req.user if token is valid
 */
const authenticate = (required = true) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        if (required) {
          return res.status(401).json({
            error: { message: 'Authentication required' },
          });
        }
        // Optional auth - continue without user
        return next();
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      const decoded = verifyToken(token);
      
      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
      };

      next();
    } catch (error) {
      if (required) {
        return res.status(401).json({
          error: { message: error.message || 'Invalid token' },
        });
      }
      // Optional auth - continue without user if token invalid
      next();
    }
  };
};

module.exports = authenticate;
