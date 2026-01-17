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
