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
      setError(err.message || 'Registration failed. Please try again.');
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
      setError(err.message || 'Login failed. Please try again.');
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
