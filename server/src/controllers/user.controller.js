const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Save or update user preferences
 */
exports.savePreferences = async (req, res, next) => {
  try {
    const {
      spice_level,
      budget,
      allergies = [],
      dietary_preferences = [],
      disliked_cuisines = [],
    } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: { message: 'Authentication required' },
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: { message: 'User not found' },
      });
    }

    // Update preferences
    user.preferences = {
      spice_level: spice_level || user.preferences?.spice_level || 'medium',
      budget: budget || user.preferences?.budget || 'any',
      allergies,
      dietary_preferences,
      disliked_cuisines,
    };
    
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};
