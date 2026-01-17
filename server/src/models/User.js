const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passkey_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passkey',
    default: null,
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
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
