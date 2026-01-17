'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { SecurityTooltip } from '@/components/ui/SecurityTooltip';

export function PasskeyButton({ mode = 'login', username }) {
  const { register, login, isLoading, error } = useAuth();
  const [localUsername, setLocalUsername] = useState(username || '');

  const handleClick = async () => {
    if (!localUsername.trim()) {
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
      // Error is handled by useAuth hook and displayed via error state
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
          className="px-4 py-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading && localUsername.trim()) {
              handleClick();
            }
          }}
        />
        <SecurityTooltip text="Using WebAuthn Passkeys - No passwords stored">
          <button
            onClick={handleClick}
            disabled={isLoading || !localUsername.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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
