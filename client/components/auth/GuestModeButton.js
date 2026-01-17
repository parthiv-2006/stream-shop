'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export function GuestModeButton() {
  const { enterGuestMode, isLoading } = useAuth();

  return (
    <button
      onClick={enterGuestMode}
      disabled={isLoading}
      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 border-2 border-dashed border-gray-400 transition-colors w-full"
    >
      <span className="text-xs text-orange-600 font-semibold">[Demo Mode]</span> Continue as Guest
      <span className="text-xs text-gray-500 ml-2">(Less Secure)</span>
    </button>
  );
}
