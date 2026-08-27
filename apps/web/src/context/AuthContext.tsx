import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, YouthProfile, Business } from '@springboard/shared-types';
import { authApi, RegisterPayload, LoginPayload } from '../api/auth';
import { profilesApi } from '../api/profiles';
import { businessesApi } from '../api/businesses';

interface AuthContextType {
  user: User | null;
  profile: YouthProfile | null;
  business: Business | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'springboard_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<YouthProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(TOKEN_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async () => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);

      if (currentUser.role === 'youth') {
        try {
          const youthProfile = await profilesApi.getMyProfile();
          setProfile(youthProfile);
        } catch {
          setProfile(null);
        }
      } else if (currentUser.role === 'business') {
        try {
          const bizProfile = await businessesApi.getMyBusiness();
          setBusiness(bizProfile);
        } catch {
          setBusiness(null);
        }
      }
    } catch {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(TOKEN_KEY);
      }
      setToken(null);
      setUser(null);
      setProfile(null);
      setBusiness(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchUserData]);

  const login = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(payload);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(TOKEN_KEY, response.access_token);
      }
      setToken(response.access_token);
      setUser(response.user);

      if (response.user.role === 'youth') {
        try {
          const p = await profilesApi.getMyProfile();
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else if (response.user.role === 'business') {
        try {
          const b = await businessesApi.getMyBusiness();
          setBusiness(b);
        } catch {
          setBusiness(null);
        }
      }

      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(payload);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(TOKEN_KEY, response.access_token);
      }
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
    setUser(null);
    setProfile(null);
    setBusiness(null);
  };

  const refreshProfile = async () => {
    if (user?.role === 'youth') {
      try {
        const p = await profilesApi.getMyProfile();
        setProfile(p);
      } catch {
        setProfile(null);
      }
    } else if (user?.role === 'business') {
      try {
        const b = await businessesApi.getMyBusiness();
        setBusiness(b);
      } catch {
        setBusiness(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        business,
        token,
        role: user?.role || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
