const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  savePreferences, 
  addVisit, 
  updateVisit, 
  getVisits 
} = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');

// User profile
router.get('/profile', authenticate(true), getProfile);

// User preferences
router.post('/preferences', authenticate(true), savePreferences);

// Visit history
router.get('/visits', authenticate(true), getVisits);
router.post('/visits', authenticate(true), addVisit);
router.put('/visits/:visitId', authenticate(true), updateVisit);

module.exports = router;
