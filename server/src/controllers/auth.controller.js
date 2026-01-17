const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/errors');

/**
 * Register a new user with password
 */
exports.register = async (req, res, next) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // Validation
    if (!username || !username.trim()) {
      return res.status(400).json({
        error: { message: 'Username is required' },
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: { message: 'Password must be at least 6 characters long' },
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: { message: 'Passwords do not match' },
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(409).json({
        error: { message: 'Username already exists' },
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      username: username.trim(),
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      isGuest: false,
    });

    res.status(201).json({
      success: true,
      userId: user._id.toString(),
      token,
      username: user.username,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: { message: 'Username already exists' },
      });
    }
    next(error);
  }
};

/**
 * Login with username and password
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        error: { message: 'Username is required' },
      });
    }

    if (!password) {
      return res.status(400).json({
        error: { message: 'Password is required' },
      });
    }

    // Find user and include password field (password has select: false in schema)
    const user = await User.findOne({ username: username.trim() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: { message: 'Invalid username or password' },
      });
    }

    // Check if user has a password (not a guest user)
    if (!user.password) {
      return res.status(401).json({
        error: { message: 'Invalid username or password' },
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: { message: 'Invalid username or password' },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      isGuest: false,
    });

    res.json({
      success: true,
      userId: user._id.toString(),
      token,
      username: user.username,
    });
  } catch (error) {
    next(error);
  }
};
