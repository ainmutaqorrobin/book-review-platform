"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AuthUser,
  Role,
  SignupPayload,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from "@/utils/api/auth";
import { ApiResponse } from "@/lib/fetcher";

interface AuthContextValue {
  user: AuthUser | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  login: (username: string, password: string) => Promise<ApiResponse<null>>;
  signup: (payload: SignupPayload) => Promise<ApiResponse<AuthUser>>;
  logout: () => Promise<ApiResponse<null>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void getCurrentUser().then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    const response = await getCurrentUser();

    if (response.success && response.data) {
      setUser(response.data);
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await loginRequest(username, password);

      if (response.success) {
        await refreshUser();
      }

      return response;
    },
    [refreshUser],
  );

  const signup = useCallback((payload: SignupPayload) => {
    return signupRequest(payload);
  }, []);

  const logout = useCallback(async () => {
    const response = await logoutRequest();
    setUser(null);
    return response;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? "guest",
        isAuthenticated: Boolean(user),
        isLoading,
        refreshUser,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
