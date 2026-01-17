const Lobby = require('../models/Lobby');
const User = require('../models/User');
const generateLobbyCode = require('../utils/generateCode');
const AppError = require('../utils/errors');

/**
 * Create a new lobby
 */
exports.createLobby = async (req, res, next) => {
  try {
    let userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) {
      // Create guest user if no userId provided
      const guestUser = await User.create({
        username: `guest_${Date.now()}`,
      });
      userId = guestUser._id.toString();
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: { message: 'User not found' },
      });
    }

    // Generate unique 6-digit code
    const checkCodeUnique = async (code) => {
      const existing = await Lobby.findOne({ code });
      return !existing;
    };

    const code = await generateLobbyCode(checkCodeUnique);

    // Create lobby with host as first participant
    const lobby = await Lobby.create({
      code,
      name: name || `Lobby ${code}`,
      host_id: user._id,
      participants: [{
        user_id: user._id,
        name: user.username,
        isHost: true,
        isReady: true,
      }],
      status: 'waiting',
    });

    res.status(201).json({
      lobbyId: lobby._id.toString(),
      code: lobby.code,
      id: lobby._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a lobby by code
 */
exports.joinLobby = async (req, res, next) => {
  try {
    let { code } = req.body;
    const userId = req.user?.userId;

    // Normalize code: convert to string, trim whitespace
    if (typeof code === 'number') {
      code = code.toString();
    }
    code = String(code).trim();

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: { message: 'Valid 6-digit lobby code is required' },
      });
    }

    // Find lobby by code
    const lobby = await Lobby.findOne({ code });
    if (!lobby) {
      return res.status(404).json({
        error: { message: 'Lobby not found. Please check the code.' },
      });
    }

    // Check if lobby is open for joining
    if (lobby.status !== 'waiting') {
      return res.status(400).json({
        error: { message: 'Lobby is no longer accepting new participants' },
      });
    }

    // Handle user (create guest if needed)
    let user;
    if (userId) {
      user = await User.findById(userId);
    }

    if (!user) {
      // Create guest user
      user = await User.create({
        username: `guest_${Date.now()}`,
      });
    }

    // Check if user is already a participant
    const existingParticipant = lobby.participants.find(
      p => p.user_id.toString() === user._id.toString()
    );

    if (existingParticipant) {
      return res.json({
        lobbyId: lobby._id.toString(),
        code: lobby.code,
      });
    }

    // Add user as participant
    lobby.participants.push({
      user_id: user._id,
      name: user.username,
      isHost: false,
      isReady: true,
    });

    await lobby.save();

    res.json({
      lobbyId: lobby._id.toString(),
      code: lobby.code,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get lobby details
 */
exports.getLobby = async (req, res, next) => {
  try {
    const { lobbyId } = req.params;

    const lobby = await Lobby.findById(lobbyId).populate('participants.user_id', 'username preferences');
    
    if (!lobby) {
      return res.status(404).json({
        error: { message: 'Lobby not found' },
      });
    }

    // Format participants for frontend
    const participants = lobby.participants.map(p => ({
      id: p.user_id._id?.toString() || p.user_id.toString(),
      name: p.name || p.user_id.username || 'Anonymous',
      isHost: p.isHost,
      isReady: p.isReady,
    }));

    res.json({
      id: lobby._id.toString(),
      code: lobby.code,
      name: lobby.name,
      participants,
      restaurants: lobby.restaurants || [],
      status: lobby.status,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        error: { message: 'Lobby not found' },
      });
    }
    next(error);
  }
};

/**
 * Start matching process for lobby
 */
exports.startMatching = async (req, res, next) => {
  try {
    const { lobbyId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: { message: 'Authentication required' },
      });
    }

    const lobby = await Lobby.findById(lobbyId);
    
    if (!lobby) {
      return res.status(404).json({
        error: { message: 'Lobby not found' },
      });
    }

    // Verify user is the host
    if (lobby.host_id.toString() !== userId) {
      return res.status(403).json({
        error: { message: 'Only the lobby host can start matching' },
      });
    }

    // Check minimum participants (at least 2)
    if (lobby.participants.length < 2) {
      return res.status(400).json({
        error: { message: 'At least 2 participants are required to start matching' },
      });
    }

    // Update lobby status
    lobby.status = 'matching';
    await lobby.save();

    res.json({
      success: true,
      message: 'Matching started',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        error: { message: 'Lobby not found' },
      });
    }
    next(error);
  }
};
