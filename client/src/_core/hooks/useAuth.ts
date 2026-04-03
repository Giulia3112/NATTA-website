import { firebaseAuth } from "@/lib/firebase";
import { trpc } from "@/lib/trpc";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();
  const { firebaseUser, firebaseLoading } = useFirebaseAuth();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !firebaseLoading,
  });

  // Re-fetch DB user whenever Firebase auth state changes
  useEffect(() => {
    if (!firebaseLoading) {
      utils.auth.me.invalidate();
    }
  }, [firebaseUser, firebaseLoading, utils]);

  const logout = useCallback(async () => {
    try {
      await signOut(firebaseAuth);
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    } catch (error) {
      console.error("[Auth] Logout failed", error);
    }
  }, [utils]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: firebaseLoading || meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    firebaseLoading,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (firebaseLoading || meQuery.isLoading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    firebaseLoading,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    firebaseUser,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
