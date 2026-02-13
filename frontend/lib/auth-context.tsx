"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types/auth";
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  getMe,
  refreshAccessToken,
  patchMe,
  uploadAvatarPhoto,
} from "@/lib/api";

const STORAGE_KEYS = {
  accessToken: "docit_access_token",
  refreshToken: "docit_refresh_token",
  expiresAt: "docit_expires_at",
  user: "docit_user",
} as const;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  setAuthFromCallback: (user: User, accessToken: string, refreshToken: string, expiresIn: number) => void;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;
  getAccessToken: () => string | null;
  /** Try to refresh the access token using stored refresh token. On success updates state and returns new token; on failure clears session and returns null. */
  refreshAndGetToken: () => Promise<string | null>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStored(): { user: User | null; accessToken: string | null; refreshToken: string | null } {
  if (typeof window === "undefined") return { user: null, accessToken: null, refreshToken: null };
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    const userRaw = localStorage.getItem(STORAGE_KEYS.user);
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    return { user, accessToken, refreshToken };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

function persist(user: User, accessToken: string, refreshToken: string, expiresIn: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));
  } catch {
    // ignore
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.expiresAt);
    localStorage.removeItem(STORAGE_KEYS.user);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    loading: true,
    error: null,
  });

  const logout = useCallback(() => {
    clearStorage();
    setState({ user: null, accessToken: null, loading: false, error: null });
  }, []);

  const setAuthFromCallback = useCallback(
    (user: User, accessToken: string, refreshToken: string, expiresIn: number) => {
      persist(user, accessToken, refreshToken, expiresIn);
      setState({ user, accessToken, loading: false, error: null });
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await getGoogleAuthUrl();
      if (!result.success) {
        setState((s) => ({ ...s, loading: false, error: result.error.message }));
        return;
      }
      window.location.href = result.data.url;
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Something went wrong. Please try again." }));
    }
  }, []);

  const getAccessToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }, []);

  const refreshAndGetToken = useCallback(async (): Promise<string | null> => {
    const { user, refreshToken } = loadStored();
    if (!refreshToken || !user) return null;
    const result = await refreshAccessToken(refreshToken);
    if (!result.success) {
      clearStorage();
      setState({ user: null, accessToken: null, loading: false, error: null });
      return null;
    }
    persist(user, result.data.accessToken, refreshToken, result.data.expiresIn);
    setState((s) => (s.user ? { ...s, accessToken: result.data.accessToken } : s));
    return result.data.accessToken;
  }, []);

  const updateProfile = useCallback(
    async (data: { name?: string; avatar?: string }) => {
      let token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.accessToken) : null;
      if (!token) token = await refreshAndGetToken();
      if (!token) return { success: false, error: "Session expired. Please sign in again." };
      let result = await patchMe(token, data);
      if (!result.success && result.error?.code === "UNAUTHORIZED") {
        const newToken = await refreshAndGetToken();
        if (newToken) result = await patchMe(newToken, data);
      }
      if (!result.success) {
        return { success: false, error: result.error?.message ?? "Update failed" };
      }
      const updatedUser = result.data;
      setState((s) => (s.user ? { ...s, user: updatedUser } : s));
      try {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
      return { success: true };
    },
    [refreshAndGetToken]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      let token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.accessToken) : null;
      if (!token) token = await refreshAndGetToken();
      if (!token) return { success: false, error: "Session expired. Please sign in again." };
      let result = await uploadAvatarPhoto(token, file);
      if (!result.success && result.error?.code === "UNAUTHORIZED") {
        const newToken = await refreshAndGetToken();
        if (newToken) result = await uploadAvatarPhoto(newToken, file);
      }
      if (!result.success) {
        return { success: false, error: result.error?.message ?? "Upload failed" };
      }
    const updatedUser = result.data;
    setState((s) => (s.user ? { ...s, user: updatedUser } : s));
    try {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
    return { success: true };
  }, [refreshAndGetToken]);

  // On mount: restore from storage and validate with /me; on 401 try refresh
  useEffect(() => {
    const { user, accessToken, refreshToken } = loadStored();
    if (!accessToken && !refreshToken) {
      setState({ user: null, accessToken: null, loading: false, error: null });
      return;
    }
    if (accessToken && user) {
      getMe(accessToken).then((res) => {
        if (res.success) {
          setState({ user: res.data, accessToken, loading: false, error: null });
          return;
        }
        if (res.error?.code === "UNAUTHORIZED" && refreshToken) {
          refreshAccessToken(refreshToken).then((r) => {
            if (r.success) {
              persist(user, r.data.accessToken, refreshToken, r.data.expiresIn);
              setState({ user, accessToken: r.data.accessToken, loading: false, error: null });
            } else {
              clearStorage();
              setState({ user: null, accessToken: null, loading: false, error: null });
            }
          });
        } else {
          setState({ user, accessToken, loading: false, error: null });
        }
      });
      return;
    }
    if (refreshToken && user) {
      refreshAccessToken(refreshToken).then((r) => {
        if (r.success) {
          persist(user, r.data.accessToken, refreshToken, r.data.expiresIn);
          setState({ user, accessToken: r.data.accessToken, loading: false, error: null });
        } else {
          clearStorage();
          setState({ user: null, accessToken: null, loading: false, error: null });
        }
      });
      return;
    }
    setState({ user, accessToken, loading: false, error: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      loginWithGoogle,
      logout,
      setAuthFromCallback,
      updateProfile,
      uploadAvatar,
      getAccessToken,
      refreshAndGetToken,
      isAuthenticated: !!state.user && !!state.accessToken,
    }),
    [state, loginWithGoogle, logout, setAuthFromCallback, updateProfile, uploadAvatar, getAccessToken, refreshAndGetToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
