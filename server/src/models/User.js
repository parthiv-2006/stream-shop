const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  restaurant_id: {
    type: String,
    required: true,
  },
  restaurant_name: {
    type: String,
    required: true,
  },
  restaurant_cuisine: {
    type: String,
  },
  restaurant_image: {
    type: String,
  },
  // Overall rating
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  // Detailed review text
  review: {
    type: String,
    maxlength: 1000,
  },
  // Specific aspect ratings
  aspects: {
    food_quality: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    ambiance: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
  },
  // What dishes they tried
  dishes_tried: [{
    type: String,
  }],
  // Would they go back?
  would_return: {
    type: Boolean,
  },
  // Tags for quick categorization
  tags: [{
    type: String,
    enum: ['great-for-groups', 'romantic', 'quick-service', 'good-portions', 
           'instagram-worthy', 'hidden-gem', 'loud', 'quiet', 'kid-friendly',
           'date-night', 'casual', 'upscale', 'outdoor-seating', 'late-night'],
  }],
  // Whether feedback has been completed
  feedback_completed: {
    type: Boolean,
    default: false,
  },
  visited_at: {
    type: Date,
    default: Date.now,
  },
  feedback_at: {
    type: Date,
  },
  lobby_id: {
    type: String,
  },
}, { _id: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  preferences: {
    spice_level: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'medium',
    },
    budget: {
      type: String,
      enum: ['low', 'medium', 'high', 'any'],
      default: 'any',
    },
    allergies: [{
      type: String,
    }],
    dietary_preferences: [{
      type: String,
    }],
    disliked_cuisines: [{
      type: String,
    }],
  },
  amplitude_behavioral_score: {
    adventurousness: {
      type: Number,
      default: 0,
    },
    budget_sensitivity: {
      type: String,
      default: 'medium',
    },
  },
  // Visit history with reviews
  visits: [visitSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
