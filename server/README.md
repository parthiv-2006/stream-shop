# TasteSync Backend API Server

Backend API server for TasteSync supporting Passkey authentication, user preferences, and lobby management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
PORT=3001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
RP_ID=localhost
RP_NAME=TasteSync
RP_ORIGIN=http://localhost:3000

# Optional: For real restaurant data from Yelp API
YELP_API_KEY=your_yelp_api_key_here

# Optional: For AI-powered restaurant recommendations
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=your_gemini_api_url_here
GEMINI_MODEL=your_gemini_model_name_here
```

**Note:** Without `YELP_API_KEY`, the system will use hard-coded sample restaurants from the database. To use real restaurant data, you must set `YELP_API_KEY` with a valid Yelp Fusion API key.

3. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication (`/api/auth/passkey`)
- `POST /api/auth/passkey/register-options` - Get Passkey registration options
- `POST /api/auth/passkey/register-verify` - Verify Passkey registration
- `POST /api/auth/passkey/auth-options` - Get Passkey authentication options
- `POST /api/auth/passkey/auth-verify` - Verify Passkey authentication

### User (`/api/user`)
- `POST /api/user/preferences` - Save/update user preferences

### Lobby (`/api/lobby`)
- `POST /api/lobby/create` - Create a new lobby
- `POST /api/lobby/join` - Join a lobby by code
- `GET /api/lobby/:lobbyId` - Get lobby details
- `POST /api/lobby/:lobbyId/start-matching` - Start matching process

## Health Check

`GET /health` - Server health check endpoint
