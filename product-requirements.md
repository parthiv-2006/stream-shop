Product Requirements Document: StreamShop
Hackathon: UofTHacks 13 (2026)
Theme: Identity
Tagline: See it. Click it. Own it. The video player that learns your style.
Platform: Chrome Extension (React) + MERN Stack Backend

1. The Core Concept
StreamShop is a contextual commerce engine that transforms passive video consumption into active shopping.
The Hook: It allows users to pause any video (YouTube, Netflix, etc.) to identify items on screen.
The "Identity" (MongoDB + Amplitude): Unlike a standard search, StreamShop remembers. It builds a persistent "Style Identity" in MongoDB based on user interactions.
The Self-Improvement: It uses this stored identity to dynamically re-rank future Shopify search results, tailoring the shopping experience to the user's specific aesthetic (e.g., "Vintage," "Streetwear," "Minimalist").

2. Technical Architecture & Data Flow
A. The Trigger (Chrome Extension)
User Action: User pauses video at 04:12 and draws a box around a jacket.
Data Capture: Extension captures Image Base64, Video ID, and Timestamp.
B. The "Memory" (MongoDB Check)
Efficiency Layer: Before calling expensive AI APIs, the Backend checks MongoDB.
Logic: db.scans.findOne({ videoId: "xyz", timestampRange: ... })
Hit: Return cached product results immediately (Speed).
Miss: Proceed to AI Analysis.
C. The Analysis (Gemini + Twelve Labs)
Gemini (The Eye): Analyzes the Image Base64 to identify the object (e.g., "Bomber Jacket").
Twelve Labs (The Vibe): Analyzes the Video ID + Timestamp to extract context (e.g., "90s Hip Hop," "Urban," "Gritty").
D. The Commerce (Shopify + MongoDB Profile)
Profile Retrieval: Backend fetches the user's "Style Identity" from MongoDB (user.style_affinity).
Smart Query: It synthesizes a query: Gemini Keywords + Twelve Labs Context + MongoDB Style Preference.
Shopify: Fetches products using the Storefront API.
E. The Feedback Loop (Amplitude + MongoDB)
User Action: User clicks a "Vintage Surplus Jacket."
Amplitude: Logs the event for analytics/visualizations.
MongoDB: Updates the user's persistent profile: $inc: { "style_affinity.vintage": 1 }.

3. Tech Stack
Component
Technology
Role
(Parthiv) Frontend
React + Vite + CRXJS
Chrome Extension UI & Overlay logic.
Backend
Node.js + Express
API Orchestration & Business Logic.
Database
MongoDB (Atlas)
The "Identity Store." Persists user profiles, style weights, and scan history.
AI (Vision)
Gemini Pro Vision
Object recognition (Image-to-Text).
AI (Video)
Twelve Labs
Scene context & "Vibe" extraction (Video-to-Text).
Analytics
Amplitude
Behavioral tracking & Cohort analysis.
Commerce
Shopify API
Product inventory & checkout.


4. Database Schema Design (MongoDB)
You will need two primary collections to handle the "Identity" and "Caching" logic.
A. Users Collection (The Style Identity)
Stores the user's evolving taste profile. This is what makes the product "Self-Improving."
JavaScript
const UserSchema = new mongoose.Schema({
  amplitude_id: { type: String, required: true, unique: true }, // Links to Amplitude
  style_identity: {
    vintage: { type: Number, default: 0 },
    streetwear: { type: Number, default: 0 },
    minimalist: { type: Number, default: 0 },
    luxury: { type: Number, default: 0 },
    // dynamic keys allowed based on Twelve Labs tags
  },
  scan_history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scan' }],
  last_active: { type: Date, default: Date.now }
});

B. Scans Collection (The Cache)
Stores results of previous scans to save API costs and speed up demos.
JavaScript
const ScanSchema = new mongoose.Schema({
  video_id: { type: String, required: true }, // e.g. YouTube Video ID
  timestamp: { type: Number, required: true }, // in seconds
  gemini_results: { type: Object }, // Cached Gemini JSON
  twelve_labs_context: [String], // Cached Context Tags
  shopify_products: [Object], // Cached Search Results
  created_at: { type: Date, default: Date.now }
});


5. API Endpoints (Backend)
POST /api/analyze
Input: { imageBase64, videoId, timestamp, userId }
Logic:
Check Scans collection for existing data.
If not found, call Gemini + Twelve Labs.
Fetch User profile from MongoDB.
Modify Shopify Query based on User.style_identity.
Return results + Save to Scans.
POST /api/interaction
Input: { userId, clickedProductTag } (e.g., "Vintage")
Logic:
Send event to Amplitude.
Update MongoDB: User.updateOne({ _id: userId }, { $inc: { ["style_identity." + tag]: 1 } })
GET /api/profile/:userId
Logic: Returns the user's "Style Graph" for the frontend dashboard.

6. Implementation Roadmap
Phase 1: Setup (Friday Night)
Initialize MERN repo (Client + Server).
Set up MongoDB Atlas Cluster and connect via mongoose.
Define the User and Scan schemas.
Set up Twelve Labs indexing for your 3 demo videos.
Phase 2: The Intelligence (Saturday Morning)
Build the Gemini route (Image $\rightarrow$ JSON).
Build the Twelve Labs route (Timestamp $\rightarrow$ Tags).
Implement the MongoDB Caching logic (Check DB before calling APIs).
Phase 3: The "Identity Loop" (Saturday Afternoon)
Connect Shopify Storefront API.
Implement the Reranking Logic:
Code: const boostTerm = user.style_identity.vintage > 5 ? "vintage" : "";
Code: const finalQuery = \${geminiItem} ${twelveLabsContext} ${boostTerm}`;`
Build the Frontend Dashboard to visualize the MongoDB data (e.g., "You are 80% Grunge").
Phase 4: Polish & Demo (Sunday Morning)
Demo Flow:
Step 1: Show clean User Profile (MongoDB empty).
Step 2: Scan item in "Music Video."
Step 3: Click item. Show MongoDB updating (Console log or UI).
Step 4: Scan item in "Movie." Show how the search results are now biased towards the previous interaction.
Step 5: Show the Amplitude Dashboard reflecting the same data.
7. Why MongoDB is a Winning Addition
Persistence: It proves you aren't just "faking" the identity for a single session. The user's style profile is permanent.
Speed: Caching scans in MongoDB prevents the demo from lagging if the APIs are slow.
Complexity: It demonstrates a full-stack architecture (Frontend $\rightarrow$ API $\rightarrow$ Database $\rightarrow$ AI), which scores higher on "Technical Depth."



