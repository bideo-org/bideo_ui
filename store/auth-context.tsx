"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { redirect, RedirectType } from "next/navigation";
import { getUser } from "@/utility/requests";
import { toast } from "sonner";

export interface User {
  userId: string;
  user_email: string;
  user_name: string;
  avatar_url: string;
  username?: string;
  fullName?: string;
  full_name?: string;
  user_role?: string;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (token: string, uid: string) => Promise<void>;
  logout: () => Promise<void>;
  user?: User;
  setUserInfo: (data: User) => void;
  uid: string | null;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/ui/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.token && data?.uid) {
            setToken((prev) => (prev !== null ? prev : data.token));
            setUid((prev) => (prev !== null ? prev : data.uid));
          }
        }
      } catch (err) {
        console.error("Session load failed:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSession();
  }, []);

  // Fetch user once both token and uid are available
  useEffect(() => {
    if (token && uid && !user) {
      fetchUser();
    }
  }, [token, uid]);

  const fetchUser = async () => {
    if (uid && token && !user) {
      try {
        const user = await getUser(uid, token);
        setUserInfo(user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        await logout();
      }
    }
  };

  const login = async (token: string, uid: string) => {
    await fetch("/ui/auth/setSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, uid }),
    });

    setToken(token);
    setUid(uid);
  };

  const logout = async () => {
    await fetch("/ui/auth/logout", {
      method: "POST",
    });

    setToken(null);
    setUid(null);
    setUser(undefined);
    toast.success("Logged out successfully!");
    redirect("/auth/login", RedirectType.replace);
  };

  const setUserInfo = (data: User) => {
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoaded,
        login,
        logout,
        user,
        setUserInfo,
        uid,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
