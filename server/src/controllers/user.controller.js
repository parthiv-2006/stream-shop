const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Save or update user preferences
 * Supports both authenticated users and guests
 */
exports.savePreferences = async (req, res, next) => {
  try {
    const {
      userId,
      spice_level,
      budget,
      allergies = [],
      dietary_preferences = [],
      disliked_cuisines = [],
    } = req.body;

    // Check if user exists (from token or userId)
    const userIdentifier = req.user?.userId || userId;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'user.controller.js:savePreferences',message:'Received preferences request',data:{userId,userIdentifier,hasAuthUser:!!req.user,authUserId:req.user?.userId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    let user;

    if (userIdentifier) {
      // Check if userIdentifier is a valid MongoDB ObjectId format (24 hex chars)
      // If it's a guest ID like "guest_123", skip findById to avoid CastError
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userIdentifier);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'user.controller.js:savePreferences',message:'Looking up user',data:{userIdentifier,isValidObjectId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (isValidObjectId) {
        user = await User.findById(userIdentifier);
      } else {
        // Invalid ObjectId format (likely a guest ID), skip lookup
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'user.controller.js:savePreferences',message:'Invalid ObjectId format, skipping lookup',data:{userIdentifier},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'user.controller.js:savePreferences',message:'User lookup result',data:{userFound:!!user,userId:user?._id?.toString()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (user) {
        // Update preferences
        user.preferences = {
          spice_level: spice_level || user.preferences.spice_level,
          budget: budget || user.preferences.budget,
          allergies,
          dietary_preferences,
          disliked_cuisines,
        };
        await user.save();
      }
    }

    // If no user found, create guest user
    if (!user) {
      const guestId = `guest_${Date.now()}`;
      user = await User.create({
        username: guestId,
        preferences: {
          spice_level: spice_level || 'medium',
          budget: budget || 'any',
          allergies,
          dietary_preferences,
          disliked_cuisines,
        },
      });

      // Generate token for guest
      const token = generateToken({
        userId: user._id.toString(),
        username: user.username,
        isGuest: true,
      });

      return res.json({
        success: true,
        user: {
          id: user._id.toString(),
          username: user.username,
          preferences: user.preferences,
        },
        token,
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'user.controller.js:savePreferences',message:'Error saving preferences',data:{error:error.message,errorName:error.name,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    next(error);
  }
};
