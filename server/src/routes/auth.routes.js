const express = require('express');
const router = express.Router();
const {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
} = require('../controllers/auth.controller');

// Passkey registration endpoints
router.post('/passkey/register-options', getRegistrationOptions);
router.post('/passkey/register-verify', verifyRegistration);

// Passkey authentication endpoints
router.post('/passkey/auth-options', getAuthenticationOptions);
router.post('/passkey/auth-verify', verifyAuthentication);

module.exports = router;
