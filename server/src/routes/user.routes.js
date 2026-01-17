const express = require('express');
const router = express.Router();
const { savePreferences } = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');

// User preferences endpoint (authentication required)
router.post('/preferences', authenticate(true), savePreferences);

module.exports = router;
