'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { lobbyApi } from '@/lib/api/lobby';
import toast from 'react-hot-toast';

function Particles() {
  return (
    <div className="particles">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function CreateLobbyPage() {
  const { isAuthenticated, hasHydrated } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, hasHydrated, router]);

  const handleCreateLobby = async () => {
    setIsCreating(true);
    try {
      const result = await lobbyApi.create();
      const lobbyId = result.lobbyId || result.id;
      toast.success('Lobby created!');
      // Redirect to the room page where they'll complete vibe check
      router.push(`/lobby/${lobbyId}/room`);
    } catch (error) {
      toast.error(error.message || 'Failed to create lobby. Please try again.');
      setIsCreating(false);
    }
  };

  if (!hasHydrated || (!isAuthenticated && hasHydrated)) {
    return (
      <div className="min-h-screen bg-animated-gradient flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff6b35] animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#f72585] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-animated-gradient text-white relative overflow-hidden flex items-center justify-center p-4">
      <Particles />
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#ff6b35]/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#7209b7]/30 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#f72585] flex items-center justify-center text-4xl animate-float">
            🚀
          </div>
          
          <h1 className="text-3xl font-bold mb-3 gradient-text">Create a Lobby</h1>
          <p className="text-white/60 mb-8">Start a group session and invite your friends to find the perfect restaurant together</p>
          
          <button
            onClick={handleCreateLobby}
            disabled={isCreating}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f72585] text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all hover:scale-[1.02] glow-orange"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : (
              'Create Lobby'
            )}
          </button>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#1a1a2e] text-white/40 text-sm">or</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/lobby/join')}
            className="w-full py-4 px-6 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/10"
          >
            Join Existing Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
