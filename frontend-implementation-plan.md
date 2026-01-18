# Frontend Implementation Plan: Palate
**Developer:** Parthiv (Frontend Lead & Auth)  
**Tech Stack:** Next.js 14+ (App Router), React, Tailwind CSS, JavaScript  
**Deployment:** Vercel  
**Date:** January 17, 2026

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Dependencies & Setup](#dependencies--setup)
3. [Authentication System (Passkeys)](#authentication-system-passkeys)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Security Transparency Features](#security-transparency-features)
8. [Page Components](#page-components)
9. [UI Components](#ui-components)
10. [Styling Guidelines](#styling-guidelines)
11. [Implementation Timeline](#implementation-timeline)

---

## 1. Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.js                # Root layout with providers
│   ├── page.js                  # Landing page
│   ├── auth/
│   │   ├── register/            # Passkey registration
│   │   ├── login/               # Passkey login
│   │   └── guest/               # Guest mode entry
│   ├── onboarding/
│   │   └── page.js              # Profile creation form
│   ├── lobby/
│   │   ├── create/
│   │   │   └── page.js          # Create lobby (generate code)
│   │   ├── [lobbyId]/
│   │   │   └── page.js          # Join lobby (code entry)
│   │   └── [lobbyId]/room/
│   │       └── page.js          # Lobby room (participants view)
│   ├── matching/
│   │   └── [lobbyId]/
│   │       └── page.js          # Swipe interface
│   ├── voting/
│   │   └── [lobbyId]/
│   │       └── page.js          # Voting interface
│   └── results/
│       └── [lobbyId]/
│           └── page.js          # Results reveal
├── components/
│   ├── auth/
│   │   ├── PasskeyButton.js     # Passkey registration/login button
│   │   ├── PasskeyStatus.js     # Auth status indicator
│   │   └── GuestModeButton.js   # Guest mode fallback
│   ├── lobby/
│   │   ├── LobbyCode.js         # 6-digit code display/entry
│   │   ├── ParticipantList.js   # Real-time participant list
│   │   ├── LobbyStatus.js       # Lobby state indicator
│   │   └── QRCode.js            # QR code generation (optional)
│   ├── matching/
│   │   ├── SwipeCard.js         # Individual restaurant card
│   │   ├── SwipeContainer.js    # Swipe gesture handler
│   │   └── SwipeStack.js        # Card stack container
│   ├── voting/
│   │   ├── VoteCard.js          # Restaurant option card
│   │   ├── VoteButton.js        # Yes/No vote buttons
│   │   └── ResultsReveal.js     # Animated results reveal
│   ├── onboarding/
│   │   ├── PreferenceForm.js    # Profile preferences form
│   │   ├── SpiceSelector.js     # Spice level selector
│   │   ├── BudgetSelector.js    # Budget tier selector
│   │   └── AllergySelector.js   # Allergies multi-select
│   ├── ui/
│   │   ├── SecurityBadge.js     # Security transparency badge
│   │   ├── SecurityTooltip.js   # Security info tooltip
│   │   ├── PrivacyNotice.js     # Privacy information display
│   │   ├── LoadingSpinner.js    # Loading states
│   │   ├── ErrorBoundary.js     # Error handling
│   │   └── Button.js            # Reusable button component
│   └── layout/
│       ├── Header.js            # App header/navigation
│       └── Footer.js            # Footer (optional)
├── lib/
│   ├── auth/
│   │   ├── passkey.js           # Passkey client-side logic
│   │   └── guest.js             # Guest session management
│   ├── api/
│   │   ├── client.js            # API client setup (fetch/axios)
│   │   ├── auth.js              # Auth API calls
│   │   ├── lobby.js             # Lobby API calls
│   │   ├── matching.js          # Matching/swiping API calls
│   │   └── voting.js            # Voting API calls
│   ├── hooks/
│   │   ├── useAuth.js           # Authentication hook
│   │   ├── useLobby.js          # Lobby state hook
│   │   ├── usePolling.js        # Polling hook for real-time updates
│   │   └── useSwipe.js          # Swipe gesture hook
│   ├── utils/
│   │   ├── validation.js        # Form validation helpers
│   │   ├── formatting.js        # Data formatting utilities
│   │   └── constants.js         # App constants
│   └── analytics/
│       └── events.js            # Behavioral event tracking (Amplitude principles)
├── store/
│   └── authStore.js             # Zustand auth state store
├── styles/
│   └── globals.css              # Global styles + Tailwind imports
├── public/
│   ├── icons/                   # SVG icons
│   └── images/                  # Static images
├── .env.local                   # Environment variables (API URLs)
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json                 # Dependencies
└── README.md                    # Setup instructions

```

---

## 2. Dependencies & Setup

### Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@simplewebauthn/browser": "^8.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### Setup Commands
```bash
# Initialize Next.js project
npx create-next-app@latest frontend --typescript=false --tailwind=true --app=true

# Install dependencies
cd frontend
npm install @simplewebauthn/browser @tanstack/react-query zustand framer-motion react-hot-toast

# Environment variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Authentication System (Passkeys)

### 3.1 Passkey Client Implementation
**File:** `lib/auth/passkey.js`

```javascript
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

/**
 * Register a new Passkey for a user
 * @param {string} username - User's username/email
 * @returns {Promise<PublicKeyCredential>} - Registration response
 */
export async function registerPasskey(username) {
  // Step 1: Get registration options from backend
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/passkey/register-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  const options = await response.json();

  // Step 2: Start Passkey registration in browser
  const attestation = await startRegistration(options);

  // Step 3: Send attestation to backend for verification
  const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/passkey/register-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, attestation })
  });

  const result = await verifyResponse.json();
  if (result.verified) {
    return { success: true, userId: result.userId };
  }
  throw new Error('Passkey registration failed');
}

/**
 * Authenticate with existing Passkey
 * @param {string} username - User's username/email
 * @returns {Promise<{success: boolean, token: string}>} - Auth result
 */
export async function authenticatePasskey(username) {
  // Step 1: Get authentication options from backend
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/passkey/auth-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  const options = await response.json();

  // Step 2: Start Passkey authentication in browser
  const assertion = await startAuthentication(options);

  // Step 3: Send assertion to backend for verification
  const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/passkey/auth-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, assertion })
  });

  const result = await verifyResponse.json();
  if (result.verified) {
    // Store auth token
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_id', result.userId);
    return { success: true, token: result.token, userId: result.userId };
  }
  throw new Error('Passkey authentication failed');
}
```

### 3.2 Auth Store (Zustand)
**File:** `store/authStore.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isGuest: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isGuest: false }),
      setToken: (token) => set({ token }),
      setGuest: () => set({ isGuest: true, user: { id: `guest_${Date.now()}`, name: 'Guest' } }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, token: null, isGuest: false, error: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

### 3.3 Auth Hook
**File:** `lib/hooks/useAuth.js`

```javascript
import { useAuthStore } from '@/store/authStore';
import { registerPasskey, authenticatePasskey } from '@/lib/auth/passkey';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, token, isGuest, isLoading, error, setUser, setToken, setGuest, setLoading, setError, logout } = useAuthStore();
  const router = useRouter();

  const register = async (username) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerPasskey(username);
      setUser({ username, id: result.userId });
      setToken(result.token);
      router.push('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticatePasskey(username);
      setUser({ username, id: result.userId });
      setToken(result.token);
      router.push('/lobby/create');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const enterGuestMode = () => {
    setGuest();
    router.push('/onboarding');
  };

  return {
    user,
    token,
    isGuest,
    isLoading,
    error,
    register,
    login,
    enterGuestMode,
    logout,
    isAuthenticated: !!(user && token) || isGuest,
  };
}
```

### 3.4 Passkey Button Component
**File:** `components/auth/PasskeyButton.js`

```javascript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { SecurityTooltip } from '@/components/ui/SecurityTooltip';

export function PasskeyButton({ mode = 'login', username }) {
  const { register, login, isLoading, error } = useAuth();
  const [localUsername, setLocalUsername] = useState(username || '');

  const handleClick = async () => {
    if (!localUsername) {
      alert('Please enter your username/email');
      return;
    }

    try {
      if (mode === 'register') {
        await register(localUsername);
      } else {
        await login(localUsername);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter username/email"
          value={localUsername}
          onChange={(e) => setLocalUsername(e.target.value)}
          className="px-4 py-2 border rounded-lg flex-1"
          disabled={isLoading}
        />
        <SecurityTooltip text="Using WebAuthn Passkeys - No passwords stored">
          <button
            onClick={handleClick}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? 'Processing...' : mode === 'register' ? 'Register with Passkey' : 'Login with Passkey'}
            <span className="text-xs">🔐</span>
          </button>
        </SecurityTooltip>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
```

### 3.5 Guest Mode Button
**File:** `components/auth/GuestModeButton.js`

```javascript
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export function GuestModeButton() {
  const { enterGuestMode, isLoading } = useAuth();

  return (
    <button
      onClick={enterGuestMode}
      disabled={isLoading}
      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 border-2 border-dashed border-gray-400"
    >
      <span className="text-xs text-orange-600 font-semibold">[Demo Mode]</span> Continue as Guest
      <span className="text-xs text-gray-500 ml-2">(Less Secure)</span>
    </button>
  );
}
```

---

## 4. Component Architecture

### 4.1 Page Components (App Router)

#### Landing Page
**File:** `app/page.js`

```javascript
'use client';

import { PasskeyButton } from '@/components/auth/PasskeyButton';
import { GuestModeButton } from '@/components/auth/GuestModeButton';
import { SecurityTooltip } from '@/components/ui/SecurityTooltip';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-4xl font-bold text-center text-gray-900">Palate</h1>
        <p className="text-center text-gray-600">Find your group's perfect dining match</p>
        
        <div className="space-y-4">
          <PasskeyButton mode="register" />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          <GuestModeButton />
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            Already have an account? <a href="/auth/login" className="text-blue-600">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### Onboarding Page
**File:** `app/onboarding/page.js`

```javascript
'use client';

import { PreferenceForm } from '@/components/onboarding/PreferenceForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (preferences) => {
    // Save preferences to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });

    if (response.ok) {
      router.push('/lobby/create');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-6">Set Your Preferences</h2>
        <PreferenceForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
```

#### Lobby Room Page
**File:** `app/lobby/[lobbyId]/room/page.js`

```javascript
'use client';

import { useParams } from 'next/navigation';
import { ParticipantList } from '@/components/lobby/ParticipantList';
import { LobbyCode } from '@/components/lobby/LobbyCode';
import { SecurityBadge } from '@/components/ui/SecurityBadge';
import { useLobby } from '@/lib/hooks/useLobby';
import { useEffect } from 'react';

export default function LobbyRoomPage() {
  const params = useParams();
  const lobbyId = params.lobbyId;
  const { lobby, participants, isLoading, startMatching } = useLobby(lobbyId);

  // Poll for lobby updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh lobby state (handled by useLobby hook)
    }, 2000);

    return () => clearInterval(interval);
  }, [lobbyId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Lobby: {lobby?.name || lobbyId}</h2>
              <SecurityBadge />
            </div>
            <LobbyCode code={lobby?.code} />
          </div>

          <ParticipantList participants={participants} />

          {participants.length >= 2 && (
            <button
              onClick={startMatching}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Start Matching ({participants.length} members ready)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### Swipe/Matching Page
**File:** `app/matching/[lobbyId]/page.js`

```javascript
'use client';

import { useParams } from 'next/navigation';
import { SwipeContainer } from '@/components/matching/SwipeContainer';
import { useLobby } from '@/lib/hooks/useLobby';
import { trackEvent } from '@/lib/analytics/events';

export default function MatchingPage() {
  const params = useParams();
  const lobbyId = params.lobbyId;
  const { restaurants } = useLobby(lobbyId);
  const currentRestaurant = restaurants[0];

  const handleSwipe = async (restaurantId, direction) => {
    // Track behavioral event following Amplitude principles
    trackEvent(direction === 'right' ? 'swipe_right' : 'swipe_left', {
      restaurant_id: restaurantId,
      restaurant_cuisine: currentRestaurant?.cuisine,
      lobby_id: lobbyId,
      timestamp: Date.now(),
    });
    // Send swipe to backend
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lobby/${lobbyId}/swipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, direction }),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Swipe to Match</h2>
        <SwipeContainer restaurants={restaurants} onSwipe={handleSwipe} />
        <p className="text-center text-gray-500 mt-4 text-sm">
          Use arrow keys or swipe to select restaurants
        </p>
      </div>
    </div>
  );
}
```

---

## 5. State Management

### 5.1 React Query Setup
**File:** `app/layout.js`

```javascript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### 5.2 Lobby Hook with Polling
**File:** `lib/hooks/useLobby.js`

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

export function useLobby(lobbyId) {
  const { token } = useAuthStore();

  // Poll lobby status every 2 seconds
  const { data: lobby, isLoading } = useQuery({
    queryKey: ['lobby', lobbyId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lobby/${lobbyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
    refetchInterval: 2000,
    enabled: !!lobbyId,
  });

  const participants = lobby?.participants || [];
  const restaurants = lobby?.restaurants || [];

  const startMatching = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lobby/${lobbyId}/start-matching`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  });

  return {
    lobby,
    participants,
    restaurants,
    isLoading,
    startMatching: startMatching.mutate,
  };
}
```

---

## 6. API Integration

### 6.1 API Client
**File:** `lib/api/client.js`

```javascript
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(endpoint, options = {}) {
  const { token } = useAuthStore.getState();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

### 6.2 Lobby API Functions
**File:** `lib/api/lobby.js`

```javascript
import { apiRequest } from './client';

export const lobbyApi = {
  create: () => apiRequest('/lobby/create', { method: 'POST' }),
  
  join: (lobbyCode) => apiRequest('/lobby/join', {
    method: 'POST',
    body: JSON.stringify({ code: lobbyCode }),
  }),
  
  get: (lobbyId) => apiRequest(`/lobby/${lobbyId}`),
  
  startMatching: (lobbyId) => apiRequest(`/lobby/${lobbyId}/start-matching`, { method: 'POST' }),
};
```

---

## 7. Security Transparency Features

### 7.1 Security Badge Component
**File:** `components/ui/SecurityBadge.js`

```javascript
'use client';

export function SecurityBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm">
      <span className="text-green-600">✓ Passkeys</span>
      <span className="text-gray-400">|</span>
      <span className="text-green-600">✓ Encrypted preferences</span>
    </div>
  );
}
```

### 7.2 Security Tooltip Component
**File:** `components/ui/SecurityTooltip.js`

```javascript
'use client';

import { useState } from 'react';

export function SecurityTooltip({ text, children }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
```

### 7.3 Privacy Notice Component
**File:** `components/ui/PrivacyNotice.js`

```javascript
'use client';

export function PrivacyNotice() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
      <p className="font-semibold mb-1">Privacy Notice</p>
      <p>Only your food preferences are shared with the group. Personal information is kept private. Lobby data is deleted after the session ends.</p>
    </div>
  );
}
```

---

## 8. Swipe Mechanism

### 8.1 Swipe Card Component
**File:** `components/matching/SwipeCard.js`

```javascript
'use client';

import { motion } from 'framer-motion';

export function SwipeCard({ restaurant, onSwipe, index }) {
  return (
    <motion.div
      className="absolute inset-0 bg-white rounded-2xl shadow-xl p-6 cursor-grab active:cursor-grabbing"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(event, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onSwipe(restaurant.id, info.offset.x > 0 ? 'right' : 'left');
        }
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ zIndex: 10 - index }}
    >
      <img
        src={restaurant.image || '/placeholder-restaurant.jpg'}
        alt={restaurant.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-2xl font-bold mb-2">{restaurant.name}</h3>
      <p className="text-gray-600 mb-2">{restaurant.cuisine}</p>
      <p className="text-sm text-gray-500">{restaurant.description}</p>
    </motion.div>
  );
}
```

### 8.2 Swipe Container Component
**File:** `components/matching/SwipeContainer.js`

```javascript
'use client';

import { SwipeCard } from './SwipeCard';
import { useEffect } from 'react';

export function SwipeContainer({ restaurants, onSwipe }) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && restaurants[0]) {
        onSwipe(restaurants[0].id, 'left');
      } else if (e.key === 'ArrowRight' && restaurants[0]) {
        onSwipe(restaurants[0].id, 'right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [restaurants, onSwipe]);

  if (restaurants.length === 0) {
    return <div className="text-center text-gray-500">No more restaurants to swipe!</div>;
  }

  return (
    <div className="relative h-[600px] w-full">
      {restaurants.slice(0, 3).map((restaurant, index) => (
        <SwipeCard
          key={restaurant.id}
          restaurant={restaurant}
          onSwipe={onSwipe}
          index={index}
        />
      ))}
    </div>
  );
}
```

---

## 9. Lobby Code Component

### 9.1 Lobby Code Display/Entry
**File:** `components/lobby/LobbyCode.js`

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LobbyCode({ code, onJoin }) {
  const [inputCode, setInputCode] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const router = useRouter();

  // Display mode (code provided)
  if (code) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Lobby Code</p>
        <div className="flex gap-2 justify-center">
          {code.split('').map((digit, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-blue-600 text-white text-2xl font-bold rounded-lg flex items-center justify-center shadow-md"
            >
              {digit}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Share this code with your friends</p>
      </div>
    );
  }

  // Entry mode (joining lobby)
  const handleDigitChange = (index, value) => {
    if (!/^\d$/.test(value) && value !== '') return;
    
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`digit-${index + 1}`)?.focus();
    }

    // Auto-submit when all digits entered
    if (newDigits.every(d => d !== '') && newDigits.join('').length === 6) {
      handleJoin(newDigits.join(''));
    }
  };

  const handleJoin = async (joinCode) => {
    if (onJoin) {
      await onJoin(joinCode);
    } else {
      router.push(`/lobby/${joinCode}/room`);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600 font-semibold">Enter Lobby Code</p>
      <div className="flex gap-2 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            id={`digit-${i}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 10. Behavioral Event Tracking (Amplitude Principles)

### 10.1 Event Tracking System
**File:** `lib/analytics/events.js`

Following Amplitude's core principles: track behavioral product analytics-style events with properties, enabling AI to analyze patterns and improve the product experience.

```javascript
/**
 * Custom event tracking system following Amplitude principles
 * Events are stored locally/in-memory and can be sent to backend for AI analysis
 */

// Event storage (in-memory for hackathon, can be extended to localStorage or backend)
let eventQueue = [];

// Maximum events to keep in memory (prevent memory bloat)
const MAX_EVENTS = 1000;

/**
 * Track a behavioral event with properties
 * Following Amplitude-style event tracking: event name + properties object
 * @param {string} eventName - Event name (e.g., 'swipe_right', 'lobby_joined')
 * @param {Object} properties - Event properties (e.g., { restaurant_id, cuisine, lobby_id })
 */
export function trackEvent(eventName, properties = {}) {
  const event = {
    event_type: eventName,
    properties: {
      ...properties,
      timestamp: Date.now(),
      session_id: getSessionId(),
      user_id: getUserId(),
    },
  };

  // Add to event queue
  eventQueue.push(event);

  // Maintain queue size
  if (eventQueue.length > MAX_EVENTS) {
    eventQueue.shift(); // Remove oldest events
  }

  // Optionally send to backend for real-time analysis (if backend ready)
  if (process.env.NEXT_PUBLIC_API_URL) {
    sendEventToBackend(event).catch(err => {
      console.warn('Failed to send event to backend:', err);
      // Events remain in queue for retry
    });
  }

  // Log for debugging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Event]', eventName, properties);
  }
}

/**
 * Get all events (for analysis or debugging)
 * @returns {Array} Array of tracked events
 */
export function getEvents() {
  return [...eventQueue];
}

/**
 * Get events filtered by event type
 * @param {string} eventType - Event type to filter by
 * @returns {Array} Filtered events
 */
export function getEventsByType(eventType) {
  return eventQueue.filter(e => e.event_type === eventType);
}

/**
 * Clear event queue (useful for testing or reset)
 */
export function clearEvents() {
  eventQueue = [];
}

/**
 * Send event to backend for AI analysis
 * Backend will use these events with Gemini to identify patterns
 */
async function sendEventToBackend(event) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return response.ok;
  } catch (error) {
    // Silently fail - events stay in queue
    return false;
  }
}

/**
 * Get or create session ID
 */
function getSessionId() {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get user ID from auth store or guest ID
 */
function getUserId() {
  if (typeof window === 'undefined') return 'unknown';
  
  // Try to get from auth store (if available)
  try {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.state?.user?.id) {
        return parsed.state.user.id;
      }
    }
  } catch (e) {
    // Fallback to guest ID
  }
  
  // Fallback to guest ID or session ID
  return sessionStorage.getItem('guest_user_id') || getSessionId();
}

// Predefined event helper functions (following Amplitude best practices)
export const events = {
  // Lobby events
  lobbyJoined: (lobbyId, userId, lobbySize) => 
    trackEvent('lobby_joined', { lobby_id: lobbyId, user_id: userId, lobby_size: lobbySize }),
  
  lobbyCreated: (lobbyId, userId) => 
    trackEvent('lobby_created', { lobby_id: lobbyId, user_id: userId }),
  
  // Swipe events
  swipeRight: (restaurantId, cuisine, lobbyId) => 
    trackEvent('swipe_right', { restaurant_id: restaurantId, restaurant_cuisine: cuisine, lobby_id: lobbyId }),
  
  swipeLeft: (restaurantId, cuisine, lobbyId) => 
    trackEvent('swipe_left', { restaurant_id: restaurantId, restaurant_cuisine: cuisine, lobby_id: lobbyId }),
  
  // Voting events
  voteYes: (restaurantId, cuisine, lobbyId) => 
    trackEvent('vote_yes', { restaurant_id: restaurantId, restaurant_cuisine: cuisine, lobby_id: lobbyId }),
  
  voteNo: (restaurantId, cuisine, lobbyId) => 
    trackEvent('vote_no', { restaurant_id: restaurantId, restaurant_cuisine: cuisine, lobby_id: lobbyId }),
  
  // Viewing events
  restaurantViewed: (restaurantId, cuisine, viewDuration) => 
    trackEvent('restaurant_viewed', { restaurant_id: restaurantId, restaurant_cuisine: cuisine, view_duration: viewDuration }),
  
  // Profile events
  preferencesUpdated: (preferences) => 
    trackEvent('preferences_updated', { preferences }),
  
  // Navigation events
  pageViewed: (pageName) => 
    trackEvent('page_viewed', { page_name: pageName }),
  
  // Error/abandonment events
  sessionAbandoned: (lastPage, duration) => 
    trackEvent('session_abandoned', { last_page: lastPage, session_duration: duration }),
};

// Export event queue for backend analysis if needed
export function getEventQueue() {
  return eventQueue;
}
```

---

## 11. Styling Guidelines

### 11.1 Tailwind Configuration
**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};
```

### 11.2 Design Principles
- **Desktop-first**: Design for desktop, then adapt for mobile
- **Color Palette**: Blue/purple gradients for trust, green for success states
- **Spacing**: Consistent padding (4, 6, 8 units) using Tailwind spacing scale
- **Typography**: Clear hierarchy with bold headings (text-2xl, text-3xl)
- **Components**: Rounded corners (rounded-lg, rounded-2xl), subtle shadows
- **Accessibility**: High contrast, focus states, keyboard navigation

---

## 12. Implementation Timeline

### Saturday 9 AM - 12 PM (Priority: Passkeys)
1. **9:00-9:30 AM**: Project setup
   - Initialize Next.js, install dependencies
   - Configure Tailwind CSS
   - Set up environment variables

2. **9:30-11:00 AM**: Passkey implementation
   - Create `lib/auth/passkey.js` with registration/login functions
   - Set up auth store (Zustand)
   - Create `PasskeyButton` and `GuestModeButton` components
   - Test with backend endpoints (or mock if backend not ready)

3. **11:00-12:00 PM**: Landing & Login pages
   - Landing page (`app/page.js`)
   - Login page (`app/auth/login/page.js`)
   - Basic routing and navigation

### Saturday 12 PM - 3 PM
1. **12:00-1:00 PM**: Onboarding flow
   - Preference form components (`PreferenceForm`, `SpiceSelector`, etc.)
   - Onboarding page with form submission
   - Connect to backend API

2. **1:00-2:30 PM**: Lobby system
   - `LobbyCode` component (display & entry)
   - Lobby creation page
   - Lobby joining page
   - `ParticipantList` component

3. **2:30-3:00 PM**: Lobby room page
   - Real-time participant list
   - Polling hook (`useLobby`)
   - Lobby status indicators

### Saturday 3 PM - 6 PM
1. **3:00-4:30 PM**: Swipe mechanism
   - `SwipeCard` component with framer-motion
   - `SwipeContainer` with keyboard shortcuts
   - Swipe page integration
   - Connect to backend API

2. **4:30-5:30 PM**: Voting UI
   - `VoteCard` component
   - Voting page
   - Results reveal animation

3. **5:30-6:00 PM**: Security transparency features
   - `SecurityBadge` component
   - `SecurityTooltip` component
   - `PrivacyNotice` component
   - Add to relevant pages

### Saturday 6 PM - 8 PM (Polish)
1. **6:00-7:00 PM**: Responsive design
   - Test on mobile devices
   - Adjust layouts for smaller screens
   - Ensure touch gestures work

2. **7:00-8:00 PM**: Polish & error handling
   - Loading states
   - Error boundaries
   - Toast notifications
   - Keyboard shortcuts documentation
   - End-to-end testing

### Saturday 8 PM - Midnight (Final Testing)
1. Test complete user flow
2. Record demo video (Passkey flow)
3. Bug fixes
4. Performance optimization

---

## 13. Key Implementation Notes

### Backend API Contract (Expected Endpoints)
```
POST /api/auth/passkey/register-options
POST /api/auth/passkey/register-verify
POST /api/auth/passkey/auth-options
POST /api/auth/passkey/auth-verify
POST /api/lobby/create
POST /api/lobby/join
GET  /api/lobby/:lobbyId
POST /api/lobby/:lobbyId/start-matching
POST /api/lobby/:lobbyId/swipe
POST /api/user/preferences
```

### Testing Checklist
- [ ] Passkey registration works
- [ ] Passkey login works
- [ ] Guest mode works as fallback
- [ ] Lobby code generation/entry works
- [ ] Real-time participant updates (polling)
- [ ] Swipe gestures work (mouse drag & keyboard)
- [ ] Voting UI functions correctly
- [ ] Security transparency features visible
- [ ] Responsive on mobile devices
- [ ] Error states handled gracefully

### Demo Video Scenarios
1. **Passkey Flow**: Show registration → login → onboarding
2. **Lobby Flow**: Create lobby → share code → friends join
3. **Matching Flow**: Swipe on restaurants → see preferences
4. **Voting Flow**: Vote on top 3 → results reveal
5. **Security**: Highlight security badges, tooltips, privacy notices

---

## 14. Quick Reference

### Common Patterns
- **API Calls**: Use `apiRequest()` from `lib/api/client.js`
- **State Management**: Zustand for auth, React Query for server state
- **Animations**: framer-motion for card swipes, simple CSS transitions elsewhere
- **Notifications**: react-hot-toast for user feedback
- **Event Tracking**: `trackEvent()` from `lib/analytics/events.js` (follows Amplitude principles)

### Troubleshooting
- **Passkeys not working**: Check browser support, ensure HTTPS
- **Polling not updating**: Verify React Query refetchInterval
- **Swipe not smooth**: Check framer-motion drag constraints
- **Styling issues**: Verify Tailwind config includes all component paths

---

**End of Implementation Plan**
