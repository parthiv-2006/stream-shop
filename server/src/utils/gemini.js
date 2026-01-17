const axios = require('axios');

const buildPrompt = (prefs = {}, candidates = []) => {
  const prefLines = [];
  // Support either a single prefs object or an array of per-participant prefs
  if (Array.isArray(prefs)) {
    prefLines.push(`Group preferences for ${prefs.length} participants:`);
    prefs.forEach((p, i) => {
      const parts = [];
      if (p.spice_level) parts.push(`Spice=${p.spice_level}`);
      if (p.budget) parts.push(`Budget=${p.budget}`);
      if (p.meal_type) parts.push(`MealType=${p.meal_type}`);
      if (p.mood) parts.push(`Mood=${p.mood}`);
      if (p.budget_today) parts.push(`BudgetToday=${p.budget_today}`);
      if (p.distance) parts.push(`Distance=${p.distance}`);
      if (p.allergies && p.allergies.length) parts.push(`Allergies=${p.allergies.join('|')}`);
      if (p.dietary_preferences && p.dietary_preferences.length) parts.push(`Dietary=${p.dietary_preferences.join('|')}`);
      prefLines.push(`Participant ${i + 1}: ${parts.join('; ')}`);
    });
  } else {
    if (prefs.spice_level) prefLines.push(`Spice level: ${prefs.spice_level}`);
    if (prefs.budget) prefLines.push(`Budget: ${prefs.budget}`);
    if (prefs.allergies && prefs.allergies.length) prefLines.push(`Allergies: ${prefs.allergies.join(', ')}`);
    if (prefs.dietary_preferences && prefs.dietary_preferences.length) prefLines.push(`Dietary preferences: ${prefs.dietary_preferences.join(', ')}`);
  }

  const candidateSummary = candidates && candidates.length
    ? `Candidate restaurants (name | rating | price | categories):\n` + candidates.slice(0, 20).map(c => `${c.name} | ${c.rating || 'N/A'} | ${c.price || 'N/A'} | ${ (c.categories||[]).map(cc=>cc.title).join(',') }`).join('\n')
    : 'No candidate list provided.';

  return `You are a helpful restaurant recommender. Given the following user preferences:\n${prefLines.join('\n')}\n\n${candidateSummary}\n\nReturn a JSON array of up to 5 recommended objects with these fields: name, reason, score (0-100), and optional source. Respond ONLY with valid JSON.`;
};

const parseJsonFromText = (text) => {
  if (!text || typeof text !== 'string') return null;
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    const chunk = text.slice(start, end + 1);
    try { return JSON.parse(chunk); } catch (e) { /* fallthrough */ }
  }
  try { return JSON.parse(text); } catch (e) { return null; }
};

async function generateRecommendations(prefs = {}, candidates = []) {
  const prompt = buildPrompt(prefs, candidates);

  // Log what we're sending to Gemini (for debugging)
  console.log('📤 Sending to Gemini API:');
  console.log('Preferences:', JSON.stringify(prefs, null, 2));
  console.log('Candidates count:', candidates.length);
  console.log('Prompt length:', prompt.length, 'characters');
  console.log('Prompt preview:', prompt.substring(0, 200) + '...');

  const url = process.env.GEMINI_API_URL;
  const key = process.env.GEMINI_API_KEY;

  // Only try Gemini API if both URL and key are properly configured
  // Skip if URL looks invalid (contains :generateText which is wrong)
  if (url && key && !url.includes(':generateText')) {
    // Try several request shapes / endpoints to increase compatibility with
    // different Gemini-style providers. If all attempts 4xx/5xx out, fall
    // back to deterministic candidate-based generator below.
    // Google Gemini API expects { contents: [{ parts: [{ text: prompt }] }] }
    // Try multiple body formats for compatibility
    const tryBodies = [
      // Google Gemini API format
      { contents: [{ parts: [{ text: prompt }] }] },
      // Alternative formats for other providers
      { input: prompt },
      { prompt },
      { text: prompt },
      { messages: [{ role: 'user', content: prompt }] },
      ...(process.env.GEMINI_MODEL ? [{ model: process.env.GEMINI_MODEL, input: prompt }] : []),
    ];

    // Build URLs to try - support both Google Gemini API and custom endpoints
    const tryUrls = [
      url,
      `${url.replace(/\/$/, '')}/generate`,
      `${url.replace(/\/$/, '')}/v1/generate`,
      ...(process.env.GEMINI_MODEL ? [
        `${url.replace(/\/$/, '')}/v1/models/${process.env.GEMINI_MODEL}/generateContent`,
        `${url.replace(/\/$/, '')}/v1/models/${process.env.GEMINI_MODEL}/generate`,
      ] : []),
      // Google Gemini API standard endpoint
      ...(process.env.GEMINI_MODEL && url.includes('generativelanguage') ? [
        `https://generativelanguage.googleapis.com/v1/models/${process.env.GEMINI_MODEL}:generateContent`,
      ] : []),
    ];

    let lastError = null;
    let hasLogged401 = false; // Track if we've already logged a 401 to reduce spam
    
    for (const u of tryUrls) {
      for (const body of tryBodies) {
        try {
          // Google Gemini API uses API key as query parameter, not Bearer token
          // Try both methods for compatibility
          const isGoogleEndpoint = u.includes('generativelanguage.googleapis.com');
          const headers = {
            'Content-Type': 'application/json',
          };
          
          // For Google endpoints, use query param; for others, try Bearer token
          const urlWithKey = isGoogleEndpoint 
            ? `${u}?key=${key}`
            : u;
          
          if (!isGoogleEndpoint) {
            headers.Authorization = `Bearer ${key}`;
          }
          
          // Log the exact request being sent (first attempt only to avoid spam)
          if (u === tryUrls[0] && body === tryBodies[0]) {
            console.log('📡 Gemini API Request:');
            console.log('URL:', urlWithKey.substring(0, 100) + '...');
            console.log('Body:', JSON.stringify(body, null, 2));
          }
          
          const res = await axios.post(urlWithKey, body, {
            headers,
            timeout: 15000,
          });

          const data = res.data;
          if (!data) throw new Error('Empty response from Gemini endpoint');

          // Google Gemini API response format: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
          if (data.candidates && Array.isArray(data.candidates) && data.candidates[0]) {
            const candidate = data.candidates[0];
            const content = candidate.content;
            if (content && content.parts && Array.isArray(content.parts)) {
              const text = content.parts.map(p => p.text || '').join('\n');
              const parsed = parseJsonFromText(text);
              if (parsed) return parsed;
            }
          }

          // Other provider formats
          if (data.output && Array.isArray(data.output) && data.output[0] && data.output[0].content) {
            const text = data.output[0].content.map(c => c.text || c).join('\n');
            const parsed = parseJsonFromText(text);
            if (parsed) return parsed;
          }

          if (data.choices && Array.isArray(data.choices) && data.choices[0]) {
            const msg = data.choices[0].message || data.choices[0];
            const text = typeof msg === 'string' ? msg : (msg.content || msg.text || '');
            const parsed = parseJsonFromText(text);
            if (parsed) return parsed;
          }

          if (typeof data === 'string') {
            const parsed = parseJsonFromText(data);
            if (parsed) return parsed;
          }

          const parsed = parseJsonFromText(JSON.stringify(data));
          if (parsed) return parsed;

          // If we got here, the endpoint responded but we couldn't parse JSON
          lastError = new Error(`Unable to parse response from ${u}`);
          console.warn(lastError.message);
        } catch (err) {
          lastError = err;
          // Only log errors for non-404s/401s or log 401 once to reduce spam
          if (err && err.response) {
            if (err.response.status === 401 && !hasLogged401) {
              console.warn('⚠️  Gemini API authentication failed (401). Check GEMINI_API_KEY. Using fallback recommendations.');
              hasLogged401 = true;
            } else if (err.response.status !== 404 && err.response.status !== 401) {
              console.warn(`Gemini request to ${u} failed with status ${err.response.status}`);
            }
          } else if (err && !err.response) {
            // Network errors are worth logging
            console.warn('Gemini request error:', err.message || err);
          }
          // Silently skip 404s and 401s after first log as they're expected during discovery
          // try next combination
        }
      }
    }

    if (lastError && lastError.response?.status !== 404) {
      // Only log if it's not just 404s (which means API not configured)
      console.warn('Gemini API not available or misconfigured, using fallback recommendations');
    }
  } else if (url && url.includes(':generateText')) {
    // User has misconfigured URL - warn once
    console.warn('⚠️  GEMINI_API_URL appears incorrect (contains :generateText). Gemini API disabled. Using fallback recommendations.');
  }

  if (Array.isArray(candidates) && candidates.length) {
    return candidates.slice(0, 5).map((c) => ({
      name: c.name,
      reason: `Matches preferences (rating ${c.rating || 'N/A'})`,
      score: Math.round(((c.rating || 3) / 5) * 80) + 10,
      source: c.source || 'yelp',
    }));
  }

  const cuisines = ['Italian','Sushi','Indian','Mexican','Thai','Mediterranean'];
  const out = [];
  for (let i = 0; i < 5; i++) {
    const name = `${prefs.budget || 'Cozy'} ${cuisines[i % cuisines.length]} Place ${i+1}`;
    out.push({ name, reason: `Good fit for ${prefs.spice_level || 'medium'} spice and ${prefs.budget || 'any'} budget`, score: 70 - i*5, source: 'generated' });
  }
  return out;
}

module.exports = { generateRecommendations };
