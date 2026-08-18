"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { LangCode } from "./translations";

export type UserRole = "seeker" | "employer" | "admin" | "manager" | "editor" | "publisher" | "advertiser";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  language: LangCode;
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, name: string, role: UserRole, avatar?: string) => Promise<void>;
  logout: () => void;
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  setUser: (u: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  language: "en",
  setLanguage: () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLang] = useState<LangCode>("en");

  useEffect(() => {
    const savedUser = localStorage.getItem("jobportal_user");
    const savedLang = localStorage.getItem("jobportal_lang") as LangCode;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.language) setLang(parsed.language);
      } catch {}
    }
    if (savedLang) setLang(savedLang);
    setLoading(false);
  }, []);

  const login = async (email: string, name: string, role: UserRole, avatar?: string) => {
    // Simulate Gmail OAuth - in real app you'd use NextAuth
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, role, avatar, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    const authUser: AuthUser = data.user;
    setUser(authUser);
    localStorage.setItem("jobportal_user", JSON.stringify(authUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jobportal_user");
  };

  const setLanguage = (lang: LangCode) => {
    setLang(lang);
    localStorage.setItem("jobportal_lang", lang);
    if (user) {
      const updated = { ...user, language: lang };
      setUser(updated);
      localStorage.setItem("jobportal_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, language, setLanguage, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
