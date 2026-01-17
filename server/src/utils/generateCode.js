/**
 * Generate a unique 6-digit lobby code
 * @param {Function} checkUnique - Function to check if code exists in database
 * @returns {Promise<string>} Unique 6-digit code
 */
async function generateLobbyCode(checkUnique) {
  const maxAttempts = 5;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Generate random 6-digit code (100000-999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if code is unique
    const isUnique = await checkUnique(code);
    
    if (isUnique) {
      return code;
    }
    
    attempts++;
  }

  throw new Error('Failed to generate unique lobby code after multiple attempts');
}

module.exports = generateLobbyCode;
