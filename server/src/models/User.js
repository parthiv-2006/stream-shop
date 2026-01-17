const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  restaurant_name: {
    type: String,
    required: true,
  },
  restaurant_cuisine: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    maxlength: 500,
  },
  visited_at: {
    type: Date,
    default: Date.now,
  },
  lobby_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lobby',
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
