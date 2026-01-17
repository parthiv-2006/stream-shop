const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Get user profile
 */
exports.getProfile = async (req, res, next) => {
  try {
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

    res.json({
      id: user._id.toString(),
      username: user.username,
      preferences: user.preferences || {},
      visits: (user.visits || []).slice(0, 10).map(v => ({
        id: v._id.toString(),
        restaurant_id: v.restaurant_id?.toString(),
        restaurant_name: v.restaurant_name,
        restaurant_cuisine: v.restaurant_cuisine,
        rating: v.rating,
        review: v.review,
        visited_at: v.visited_at,
      })),
      totalVisits: (user.visits || []).length,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

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

/**
 * Add a restaurant visit with optional review
 */
exports.addVisit = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { restaurant_id, restaurant_name, restaurant_cuisine, rating, review, lobby_id } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: { message: 'Authentication required' },
      });
    }

    if (!restaurant_id || !restaurant_name) {
      return res.status(400).json({
        error: { message: 'Restaurant ID and name are required' },
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: { message: 'User not found' },
      });
    }

    // Initialize visits array if needed
    if (!user.visits) {
      user.visits = [];
    }

    // Add new visit at the beginning
    user.visits.unshift({
      restaurant_id,
      restaurant_name,
      restaurant_cuisine,
      rating: rating || null,
      review: review || null,
      lobby_id: lobby_id || null,
      visited_at: new Date(),
    });

    await user.save();

    res.json({
      success: true,
      message: 'Visit recorded',
      visit: user.visits[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a visit review
 */
exports.updateVisit = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { visitId } = req.params;
    const { rating, review } = req.body;

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

    const visit = user.visits?.id(visitId);
    
    if (!visit) {
      return res.status(404).json({
        error: { message: 'Visit not found' },
      });
    }

    if (rating !== undefined) visit.rating = rating;
    if (review !== undefined) visit.review = review;

    await user.save();

    res.json({
      success: true,
      message: 'Visit updated',
      visit: {
        id: visit._id.toString(),
        restaurant_id: visit.restaurant_id?.toString(),
        restaurant_name: visit.restaurant_name,
        restaurant_cuisine: visit.restaurant_cuisine,
        rating: visit.rating,
        review: visit.review,
        visited_at: visit.visited_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all visits (with pagination)
 */
exports.getVisits = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10 } = req.query;

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

    const visits = user.visits || [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedVisits = visits.slice(startIndex, endIndex);

    res.json({
      visits: paginatedVisits.map(v => ({
        id: v._id.toString(),
        restaurant_id: v.restaurant_id?.toString(),
        restaurant_name: v.restaurant_name,
        restaurant_cuisine: v.restaurant_cuisine,
        rating: v.rating,
        review: v.review,
        visited_at: v.visited_at,
      })),
      total: visits.length,
      page: parseInt(page),
      totalPages: Math.ceil(visits.length / limit),
    });
  } catch (error) {
    next(error);
  }
};
