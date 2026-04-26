"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface User {
  id: number;
  username: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "哄哄模拟器_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从 localStorage 恢复登录状态
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || "登录失败" };
        }

        const userData: User = {
          id: data.user.id,
          username: data.user.username,
          createdAt: data.user.createdAt,
        };

        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
      } catch {
        return { success: false, error: "网络错误，请稍后重试" };
      }
    },
    []
  );

  const register = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || "注册失败" };
        }

        // 注册成功后自动登录
        const userData: User = {
          id: data.user.id,
          username: data.user.username,
          createdAt: data.user.createdAt,
        };

        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
      } catch {
        return { success: false, error: "网络错误，请稍后重试" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
