'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { lobbyApi } from '@/lib/api/lobby';
import toast from 'react-hot-toast';
import { useLobby } from '@/lib/hooks/useLobby';

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
  const { isAuthenticated, hasHydrated, user } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [lobbyId, setLobbyId] = useState(null);
  const [copied, setCopied] = useState(false);

  const { lobby, participants, startMatching, isStartingMatching } = useLobby(lobbyId);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, hasHydrated, router]);

  const handleCreateLobby = async () => {
    setIsCreating(true);
    try {
      const result = await lobbyApi.create();
      setLobbyId(result.lobbyId || result.id);
      toast.success('Lobby created! Share the code with your friends.');
    } catch (error) {
      toast.error(error.message || 'Failed to create lobby. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartMatching = async () => {
    try {
      startMatching();
      router.push(`/matching/${lobbyId}`);
    } catch (error) {
      toast.error('Failed to start matching. Please try again.');
    }
  };

  const copyCode = () => {
    if (lobby?.code) {
      navigator.clipboard.writeText(lobby.code);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
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

  // Pre-lobby creation view
  if (!lobbyId && !isCreating) {
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

  // Lobby room view
  if (lobbyId) {
    const isHost = lobby?.host_id === user?.userId;
    
    return (
      <div className="min-h-screen bg-animated-gradient text-white relative overflow-hidden p-4">
        <Particles />
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#4cc9f0]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#ff6b35]/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto py-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="glass-card rounded-3xl overflow-hidden">
            {/* Header with code */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#ff6b35]/10 to-[#f72585]/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">Your Lobby</h1>
                    {isHost && (
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#ffd60a] to-[#ff6b35] text-xs font-bold text-black">
                        HOST
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm">Share the code below to invite friends</p>
                </div>
                
                <button
                  onClick={copyCode}
                  className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/20"
                >
                  <span className="text-2xl font-mono font-bold tracking-wider text-[#4cc9f0]">
                    {lobby?.code || '------'}
                  </span>
                  <div className={`p-2 rounded-lg ${copied ? 'bg-green-500' : 'bg-white/10 group-hover:bg-white/20'} transition-all`}>
                    {copied ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
            
            {/* Participants */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white/50 text-sm uppercase tracking-wider font-semibold">Participants</span>
                <span className="px-2 py-0.5 rounded-full bg-[#4cc9f0]/20 text-[#4cc9f0] text-xs font-bold">
                  {participants.length}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                {participants.map((participant, idx) => (
                  <div
                    key={participant.user_id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7209b7] to-[#f72585] flex items-center justify-center text-lg font-bold">
                      {participant.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{participant.name}</div>
                      <div className="text-white/40 text-sm">
                        {participant.isHost ? 'Host' : 'Member'}
                      </div>
                    </div>
                    {participant.isHost && (
                      <span className="text-xl">👑</span>
                    )}
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                ))}
                
                {participants.length < 2 && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-white/20 text-white/40">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Waiting for friends...</div>
                      <div className="text-sm">Share the code above</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="space-y-3">
                {participants.length >= 2 ? (
                  <button
                    onClick={handleStartMatching}
                    disabled={isStartingMatching}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#4cc9f0] to-[#7209b7] text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all hover:scale-[1.01] glow-cyan"
                  >
                    {isStartingMatching ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Starting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>🎯</span>
                        Start Matching ({participants.length} ready)
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="text-center py-4 text-white/40 text-sm">
                    Need at least 2 participants to start
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff6b35] animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#f72585] animate-spin" style={{ animationDirection: 'reverse' }}></div>
      </div>
    </div>
  );
}
