const express = require('express');
const router = express.Router();
const { savePreferences } = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');

// User preferences endpoint (optional auth for guest support)
router.post('/preferences', authenticate(false), savePreferences);

module.exports = router;
