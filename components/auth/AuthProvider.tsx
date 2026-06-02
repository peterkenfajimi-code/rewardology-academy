"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "@/components/auth/AuthModal";
import { safeNextPath } from "@/lib/auth/routes";
import "@/styles/auth.css";

export type AuthMode = "login" | "signup";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  supabase: SupabaseClient | null;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo<SupabaseClient | null>(
    () => (CONFIGURED ? createClient() : null),
    []
  );

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(CONFIGURED);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const pendingNext = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && pendingNext.current) {
        const target = pendingNext.current;
        pendingNext.current = null;
        router.push(target);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Legacy ?auth=1 links → dedicated login page with return path.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "1") {
      const next = safeNextPath(params.get("next"), "/");
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [router]);

  const openAuth = useCallback((m: AuthMode = "login") => {
    setMode(m);
    setModalOpen(true);
  }, []);

  const closeAuth = useCallback(() => setModalOpen(false), []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, configured: CONFIGURED, supabase, openAuth, closeAuth, signOut }),
    [user, loading, supabase, openAuth, closeAuth, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modalOpen && (
        <AuthModal
          mode={mode}
          setMode={setMode}
          onClose={closeAuth}
          supabase={supabase}
          configured={CONFIGURED}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
