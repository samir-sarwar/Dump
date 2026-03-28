import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api } from './api/client';
import * as tokenStorage from './token-storage';
import type { UserProfileDto, AuthResponseDto } from './types';

interface AuthState {
  user: UserProfileDto | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (profile: UserProfileDto) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        if (accessToken) {
          api.setAccessToken(accessToken);
          const me = await api.get<UserProfileDto>('/api/auth/me');
          setUser(me);
        }
      } catch {
        await tokenStorage.clearTokens();
        api.setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAuthResponse = useCallback(async (data: AuthResponseDto) => {
    api.setAccessToken(data.accessToken);
    await tokenStorage.saveTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.post<AuthResponseDto>('/api/auth/login', {
        email,
        password,
      });
      await handleAuthResponse(data);
    },
    [handleAuthResponse],
  );

  const register = useCallback(
    async (
      name: string,
      username: string,
      email: string,
      password: string,
    ) => {
      const data = await api.post<AuthResponseDto>('/api/auth/register', {
        name,
        username,
        email,
        password,
      });
      await handleAuthResponse(data);
    },
    [handleAuthResponse],
  );

  const logout = useCallback(async () => {
    api.setAccessToken(null);
    await tokenStorage.clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedProfile: UserProfileDto) => {
    setUser(updatedProfile);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
