const mongoose = require('mongoose');

// Session-specific preferences (Vibe Check)
const vibeCheckSchema = new mongoose.Schema({
  meal_type: {
    type: String,
    enum: ['light', 'moderate', 'heavy', 'any'],
    default: null,
  },
  budget_today: {
    type: String,
    enum: ['cheap', 'moderate', 'fancy', 'any'],
    default: null,
  },
  mood: {
    type: String,
    enum: ['adventurous', 'comfort', 'healthy', 'indulgent', 'any'],
    default: null,
  },
  distance: {
    type: String,
    enum: ['nearby', 'moderate', 'anywhere'],
    default: null,
  },
}, { _id: false });

const participantSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isHost: {
    type: Boolean,
    default: false,
  },
  isReady: {
    type: Boolean,
    default: false,
  },
  vibeCheck: {
    type: vibeCheckSchema,
    default: null,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// Swipe records for matching phase
const swipeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant_id: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    enum: ['left', 'right'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// Vote records for voting phase
const voteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant_id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const lobbySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    length: 6,
  },
  name: {
    type: String,
  },
  host_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [participantSchema],
  status: {
    type: String,
    enum: ['waiting', 'matching', 'voting', 'completed'],
    default: 'waiting',
  },
  restaurants: [{
    type: mongoose.Schema.Types.Mixed,
  }],
  // Restaurants assigned for this matching session
  matchingRestaurants: [{
    type: String, // Restaurant IDs
  }],
  // Swipe records for matching phase
  swipes: [swipeSchema],
  // Restaurants that everyone swiped right on (for voting)
  consensusRestaurants: [{
    type: String, // Restaurant IDs
  }],
  // Votes for final restaurant selection
  votes: [voteSchema],
  // Final winning restaurant
  winningRestaurant: {
    type: String,
  },
  // Restaurants that are tied (for revoting)
  tiedRestaurants: [{
    type: String,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Lobby', lobbySchema);
