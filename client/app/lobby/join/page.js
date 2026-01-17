'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
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

export default function JoinLobbyPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isJoining, setIsJoining] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all filled
    if (newCode.every(d => d !== '') && newCode.join('').length === 6) {
      handleJoin(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      handleJoin(pasted);
    }
  };

  const handleJoin = async (codeString) => {
    if (codeString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsJoining(true);
    try {
      const result = await lobbyApi.join(codeString);
      toast.success('Joined lobby!');
      const lobbyId = result.lobbyId || result.id;
      if (lobbyId) {
        router.push(`/lobby/${lobbyId}/room`);
      }
    } catch (error) {
      toast.error(error.message || 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated-gradient text-white relative overflow-hidden flex items-center justify-center p-4">
      <Particles />
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#7209b7]/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-[#4cc9f0]/30 to-transparent rounded-full blur-3xl"></div>
      
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7209b7] to-[#4cc9f0] flex items-center justify-center text-4xl animate-float">
            🎯
          </div>
          
          <h1 className="text-3xl font-bold mb-3 gradient-text">Join a Lobby</h1>
          <p className="text-white/60 mb-8">Enter the 6-digit code shared by your friend</p>
          
          {/* Code Input */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isJoining}
                className="w-12 h-14 rounded-xl bg-white/10 border-2 border-white/20 text-center text-2xl font-bold text-white focus:border-[#4cc9f0] focus:bg-white/20 focus:outline-none transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {isJoining ? (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-6 h-6 border-2 border-white/30 border-t-[#4cc9f0] rounded-full animate-spin"></div>
              <span className="text-white/70">Joining lobby...</span>
            </div>
          ) : (
            <button
              onClick={() => handleJoin(code.join(''))}
              disabled={code.some(d => d === '')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#7209b7] to-[#4cc9f0] text-white font-bold text-lg hover:opacity-90 disabled:opacity-30 transition-all hover:scale-[1.02] glow-cyan"
            >
              Join Lobby
            </button>
          )}
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#1a1a2e] text-white/40 text-sm">or</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/lobby/create')}
            className="w-full py-4 px-6 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/10"
          >
            Create New Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
