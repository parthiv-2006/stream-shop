const express = require('express');
const router = express.Router();
const {
  createLobby,
  joinLobby,
  getLobby,
  startMatching,
} = require('../controllers/lobby.controller');
const authenticate = require('../middleware/auth.middleware');

// Lobby endpoints (optional auth for guest support)
router.post('/create', authenticate(false), createLobby);
router.post('/join', authenticate(false), joinLobby);
router.get('/:lobbyId', authenticate(false), getLobby);
router.post('/:lobbyId/start-matching', authenticate(true), startMatching);

module.exports = router;
