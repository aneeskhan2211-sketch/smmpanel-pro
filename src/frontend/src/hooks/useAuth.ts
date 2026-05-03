import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect } from "react";

export function useAuth() {
  const {
    identity,
    isAuthenticated: iiAuthenticated,
    login,
    clear,
  } = useInternetIdentity();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (iiAuthenticated && identity) {
      const principal = identity.getPrincipal().toText();
      const syntheticUser: User = {
        id: principal,
        username: `user_${principal.slice(0, 6)}`,
        email: "",
        walletBalance: 0,
        role: "user",
        createdAt: Date.now(),
      };
      setUser(syntheticUser);
    } else if (!iiAuthenticated) {
      logout();
    }
  }, [iiAuthenticated, identity, setUser, logout]);

  return {
    user,
    isAuthenticated: isAuthenticated || iiAuthenticated,
    login,
    logout: () => {
      clear();
      logout();
    },
  };
}
