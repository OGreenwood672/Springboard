import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, Council } from "@springboard/shared-types";
import { authApi, LoginCredentials, RegisterCouncilData } from "../api/auth";
import { councilsApi } from "../api/councils";

interface AuthContextValue {
  user: User | null;
  council: Council | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  registerCouncil: (data: RegisterCouncilData) => Promise<User>;
  logout: () => void;
  refreshCouncil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [council, setCouncil] = useState<Council | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCouncilProfile = useCallback(async () => {
    try {
      const councilData = await councilsApi.getMyCouncil();
      setCouncil(councilData);
    } catch (err) {
      console.warn("Failed to load council profile:", err);
      setCouncil(null);
    }
  }, []);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setUser(null);
      setCouncil(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getCurrentUser();
      if (currentUser.role !== "council") {
        throw new Error("Unauthorized role for Council Portal");
      }
      setUser(currentUser);
      await fetchCouncilProfile();
    } catch (err) {
      console.error("Session validation failed:", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setCouncil(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCouncilProfile]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const res = await authApi.login(credentials);
    if (res.user.role !== "council") {
      throw new Error(
        "Access denied: This portal is restricted to UK Local Councils.",
      );
    }
    localStorage.setItem("token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    await fetchCouncilProfile();
    return res.user;
  };

  const registerCouncil = async (data: RegisterCouncilData): Promise<User> => {
    const res = await authApi.registerCouncil(data);
    localStorage.setItem("token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    await fetchCouncilProfile();
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCouncil(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        council,
        token,
        isLoading,
        login,
        registerCouncil,
        logout,
        refreshCouncil: fetchCouncilProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
