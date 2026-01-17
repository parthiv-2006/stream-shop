const { generateRegistrationOptions, verifyRegistrationResponse } = require('@simplewebauthn/server');
const { generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const User = require('../models/User');
const Passkey = require('../models/Passkey');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/errors');

const rpID = process.env.RP_ID || 'localhost';
const rpName = process.env.RP_NAME || 'TasteSync';
const origin = process.env.RP_ORIGIN || 'http://localhost:3000';

/**
 * Generate registration options for Passkey registration
 */
exports.getRegistrationOptions = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: { message: 'Username is required' },
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        error: { message: 'Username already exists' },
      });
    }

    // Convert username to Buffer for userID (simplewebauthn requires Buffer/Uint8Array)
    // Use crypto.randomUUID or create a stable ID from username
    const userIDBuffer = Buffer.from(username, 'utf-8');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:getRegistrationOptions',message:'Generating registration options',data:{username,userIDType:typeof userIDBuffer,isBuffer:Buffer.isBuffer(userIDBuffer)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userIDBuffer, // Buffer is required by @simplewebauthn/server v8+
      userName: username,
      timeout: 60000,
      attestationType: 'none',
      supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
    });

    // Store challenge temporarily in session or return to client
    // For simplicity, we'll include it in the response
    res.json(options);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:getRegistrationOptions',message:'Error generating options',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    next(error);
  }
};

/**
 * Verify registration attestation and create user
 */
exports.verifyRegistration = async (req, res, next) => {
  try {
    const { username, attestation } = req.body;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:verifyRegistration',message:'Starting verification',data:{username,hasAttestation:!!attestation,hasResponse:!!attestation?.response},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!username || !attestation) {
      return res.status(400).json({
        error: { message: 'Username and attestation are required' },
      });
    }

    // Get registration options that were sent (for challenge verification)
    // In production, store challenge in session/database
    let expectedChallenge = null;
    if (attestation.response?.clientDataJSON) {
      try {
        const clientData = JSON.parse(Buffer.from(attestation.response.clientDataJSON, 'base64url').toString());
        expectedChallenge = clientData.challenge;
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:verifyRegistration',message:'Error parsing clientDataJSON',data:{error:err.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:verifyRegistration',message:'Before verification',data:{hasChallenge:!!expectedChallenge,hasResponse:!!attestation?.response},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    const verification = await verifyRegistrationResponse({
      response: attestation,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:verifyRegistration',message:'After verification',data:{verified:verification.verified,hasRegistrationInfo:!!verification.registrationInfo},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({
        error: { message: 'Registration verification failed' },
      });
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:verifyRegistration',message:'Extracting registration info',data:{hasCredentialID:!!credentialID,hasPublicKey:!!credentialPublicKey,credentialIDType:typeof credentialID,isBuffer:Buffer.isBuffer(credentialID)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Create user
    const user = await User.create({
      username,
    });

    // Save Passkey credential
    // credentialID is already a Uint8Array from verification, convert to base64url
    const credentialIdStr = Buffer.isBuffer(credentialID) 
      ? credentialID.toString('base64url')
      : Buffer.from(credentialID).toString('base64url');
    
    const publicKeyStr = Buffer.isBuffer(credentialPublicKey)
      ? credentialPublicKey.toString('base64')
      : Buffer.from(credentialPublicKey).toString('base64');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:verifyRegistration',message:'Saving passkey',data:{userId:user._id.toString(),credentialIdLength:credentialIdStr.length,publicKeyLength:publicKeyStr.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const passkey = await Passkey.create({
      user_id: user._id,
      credential_id: credentialIdStr,
      public_key: publicKeyStr,
      counter: counter || 0,
    });

    // Update user with passkey reference
    user.passkey_id = passkey._id;
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      isGuest: false,
    });

    res.json({
      verified: true,
      userId: user._id.toString(),
      token,
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c5fad2ad-7e13-4540-9d27-7cf70ab25c3b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:verifyRegistration',message:'Verification error',data:{error:error.message,errorName:error.name,stack:error.stack,code:error.code},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (error.code === 11000) {
      return res.status(409).json({
        error: { message: 'Username already exists' },
      });
    }
    next(error);
  }
};

/**
 * Generate authentication options for Passkey login
 */
exports.getAuthenticationOptions = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: { message: 'Username is required' },
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user || !user.passkey_id) {
      return res.status(404).json({
        error: { message: 'User not found or no Passkey registered' },
      });
    }

    // Get user's Passkeys
    const passkeys = await Passkey.find({ user_id: user._id });
    
    if (!passkeys || passkeys.length === 0) {
      return res.status(404).json({
        error: { message: 'No Passkeys found for user' },
      });
    }

    // Convert credentials for simplewebauthn
    const allowCredentials = passkeys.map(pk => ({
      id: Buffer.from(pk.credential_id, 'base64url'),
      type: 'public-key',
    }));

    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 60000,
      allowCredentials,
      userVerification: 'preferred',
    });

    res.json(options);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify authentication assertion and login user
 */
exports.verifyAuthentication = async (req, res, next) => {
  try {
    const { username, assertion } = req.body;

    if (!username || !assertion) {
      return res.status(400).json({
        error: { message: 'Username and assertion are required' },
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: { message: 'User not found' },
      });
    }

    // Find the Passkey credential
    const credentialID = Buffer.from(assertion.id, 'base64url').toString('base64url');
    const passkey = await Passkey.findOne({
      user_id: user._id,
      credential_id: credentialID,
    });

    if (!passkey) {
      return res.status(404).json({
        error: { message: 'Passkey not found' },
      });
    }

    const expectedChallenge = assertion.response.clientDataJSON
      ? JSON.parse(Buffer.from(assertion.response.clientDataJSON, 'base64url').toString()).challenge
      : null;

    // Verify authentication
    const verification = await verifyAuthenticationResponse({
      response: assertion,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: Buffer.from(passkey.credential_id, 'base64url'),
        publicKey: Buffer.from(passkey.public_key, 'base64'),
        counter: passkey.counter,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return res.status(400).json({
        error: { message: 'Authentication verification failed' },
      });
    }

    // Update counter
    passkey.counter = verification.authenticationInfo.newCounter;
    await passkey.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      isGuest: false,
    });

    res.json({
      verified: true,
      userId: user._id.toString(),
      token,
    });
  } catch (error) {
    next(error);
  }
};
