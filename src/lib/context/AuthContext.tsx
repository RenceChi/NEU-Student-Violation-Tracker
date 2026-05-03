import { supabase } from "@/src/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  role: "admin" | "officer" | "student";
  full_name: string;
  student_id?: string;
  section?: string;
  [key: string]: any;
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  error: null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]   = useState<Session | null>(null);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Track the user ID we already fetched so the auth state change listener
  // doesn't trigger a redundant second fetch on initial load.
  const fetchedForId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    // Skip if we already have the profile for this user
    if (fetchedForId.current === userId && profile !== null) return;

    fetchedForId.current = userId;
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("[AuthContext] Profile fetch failed:", fetchError.message);
      setError("Failed to load your profile. Please restart the app.");
      setProfile(null);
    } else {
      setProfile(data ?? null);
    }
  };

  useEffect(() => {
    // Step 1: Get the existing session on mount
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.error("[AuthContext] Session fetch failed:", sessionError.message);
        setError("Session error. Please log in again.");
        setLoading(false);
        return;
      }

      setSession(session);

      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Step 2: Listen for subsequent auth changes (login / logout / token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session?.user) {
        // Only re-fetch if this is a different user than what we already loaded
        if (fetchedForId.current !== session.user.id) {
          fetchProfile(session.user.id);
        }
      } else {
        // Logged out — clear everything
        fetchedForId.current = null;
        setProfile(null);
        setError(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}