const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';

/**
 * Generate JWT token for user
 * @param {Object} payload - Token payload { userId, username }
 * @returns {string} JWT token
 */
function generateToken(payload) {
  // 24 hours for authenticated users
  const expiresIn = '24h';
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
