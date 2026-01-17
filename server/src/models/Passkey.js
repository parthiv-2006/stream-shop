const mongoose = require('mongoose');

const passkeySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  credential_id: {
    type: String,
    required: true,
    unique: true,
  },
  public_key: {
    type: String,
    required: true,
  },
  counter: {
    type: Number,
    default: 0,
  },
  device_name: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Passkey', passkeySchema);
