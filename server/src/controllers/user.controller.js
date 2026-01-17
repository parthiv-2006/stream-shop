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

    // Get pending feedback count
    const pendingFeedback = (user.visits || []).filter(v => !v.feedback_completed).length;

    res.json({
      id: user._id.toString(),
      username: user.username,
      preferences: user.preferences || {},
      visits: (user.visits || []).slice(0, 10).map(v => formatVisit(v)),
      totalVisits: (user.visits || []).length,
      pendingFeedback,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Format a visit for API response
 */
function formatVisit(v) {
  return {
    id: v._id.toString(),
    restaurant_id: v.restaurant_id,
    restaurant_name: v.restaurant_name,
    restaurant_cuisine: v.restaurant_cuisine,
    restaurant_image: v.restaurant_image,
    rating: v.rating,
    review: v.review,
    aspects: v.aspects || {},
    dishes_tried: v.dishes_tried || [],
    would_return: v.would_return,
    tags: v.tags || [],
    feedback_completed: v.feedback_completed || false,
    visited_at: v.visited_at,
    feedback_at: v.feedback_at,
    lobby_id: v.lobby_id,
  };
}

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
    const { 
      restaurant_id, 
      restaurant_name, 
      restaurant_cuisine, 
      restaurant_image,
      lobby_id 
    } = req.body;

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

    // Check if this restaurant was already visited in this lobby
    const existingVisit = user.visits.find(
      v => v.restaurant_id === restaurant_id && v.lobby_id === lobby_id
    );

    if (existingVisit) {
      return res.json({
        success: true,
        message: 'Visit already recorded',
        visit: formatVisit(existingVisit),
      });
    }

    // Add new visit at the beginning
    user.visits.unshift({
      restaurant_id,
      restaurant_name,
      restaurant_cuisine,
      restaurant_image,
      lobby_id: lobby_id || null,
      visited_at: new Date(),
      feedback_completed: false,
    });

    await user.save();

    res.json({
      success: true,
      message: 'Visit recorded',
      visit: formatVisit(user.visits[0]),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit detailed feedback for a visit
 */
exports.submitFeedback = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { visitId } = req.params;
    const { 
      rating, 
      review, 
      aspects,
      dishes_tried,
      would_return,
      tags,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: { message: 'Authentication required' },
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: { message: 'Rating (1-5) is required' },
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

    // Update the visit with feedback
    visit.rating = rating;
    visit.review = review || '';
    visit.would_return = would_return;
    visit.feedback_completed = true;
    visit.feedback_at = new Date();

    // Update aspect ratings if provided
    if (aspects) {
      visit.aspects = {
        food_quality: aspects.food_quality || null,
        service: aspects.service || null,
        ambiance: aspects.ambiance || null,
        value: aspects.value || null,
      };
    }

    // Update dishes tried
    if (dishes_tried && Array.isArray(dishes_tried)) {
      visit.dishes_tried = dishes_tried.filter(d => d && d.trim());
    }

    // Update tags
    if (tags && Array.isArray(tags)) {
      visit.tags = tags;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      visit: formatVisit(visit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a visit review (simple update)
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
      visit: formatVisit(visit),
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
    const { page = 1, limit = 10, pending_only } = req.query;

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

    let visits = user.visits || [];
    
    // Filter to only pending feedback if requested
    if (pending_only === 'true') {
      visits = visits.filter(v => !v.feedback_completed);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedVisits = visits.slice(startIndex, endIndex);

    res.json({
      visits: paginatedVisits.map(v => formatVisit(v)),
      total: visits.length,
      page: parseInt(page),
      totalPages: Math.ceil(visits.length / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single visit by ID
 */
exports.getVisit = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { visitId } = req.params;

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

    res.json({
      visit: formatVisit(visit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending feedback visits
 */
exports.getPendingFeedback = async (req, res, next) => {
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

    const pendingVisits = (user.visits || []).filter(v => !v.feedback_completed);

    res.json({
      visits: pendingVisits.map(v => formatVisit(v)),
      count: pendingVisits.length,
    });
  } catch (error) {
    next(error);
  }
};
