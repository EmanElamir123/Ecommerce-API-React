import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

/**
 * بيدير حالة تسجيل الدخول في كل التطبيق: التوكن، بيانات المستخدم،
 * وبيحفظهم في localStorage عشان الجلسة تفضل شغالة بعد ما المستخدم يعمل ريفريش.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistSession = (authResponse) => {
    localStorage.setItem("accessToken", authResponse.accessToken);
    localStorage.setItem("authUser", JSON.stringify(authResponse.user));
    setUser(authResponse.user);
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      persistSession(response);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await authApi.register(payload);
      persistSession(response);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    setUser(null);
  };

  const refreshProfile = async () => {
    const profile = await authApi.getMyProfile();
    const stored = JSON.parse(localStorage.getItem("authUser") || "{}");
    const merged = { ...stored, ...profile };
    localStorage.setItem("authUser", JSON.stringify(merged));
    setUser(merged);
    return merged;
  };

  // مزامنة الجلسة بين تابات المتصفح المختلفة
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authUser") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAdmin = useMemo(() => user?.roles?.includes("Admin") ?? false, [user]);
  const isBackOffice = useMemo(
    () =>
      user?.roles?.some((r) => ["Admin", "Transportista", "Atención al público", "Plus", "CustomerService", "DeliveryDriver"].includes(r)) ??
      false,
    [user]
  );

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin,
    isBackOffice,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth لازم يتستخدم جوه AuthProvider");
  return ctx;
}
