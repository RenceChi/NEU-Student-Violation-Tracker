// app/_layout.tsx  ← root layout
import { AuthProvider, useAuth } from "@/src/lib/context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "../global.css";

// ─── Navigation Guard ─────────────────────────────────────────────────────────
// This component lives INSIDE AuthProvider so it can read session + profile.
// It watches for auth state changes and redirects accordingly.
// Separated from RootLayout so AuthProvider is always mounted first.

function NavigationGuard() {
  const { session, profile, loading } = useAuth();
  const router   = useRouter();
  const segments = useSegments(); // tells us which route group we're currently in

  useEffect(() => {
    // Don't redirect while AuthContext is still loading the session.
    // Without this guard, the app redirects to login on every cold start
    // even when the user has an active session in AsyncStorage.
    if (loading) return;

    // Check if the user is currently inside the (auth) group
    const inAuthGroup = segments[0] === "(auth)";

    if (!session) {
      // ── No session → send to login ──────────────────────────────────────
      // Handles: logout, session expiry, first launch
      // The inAuthGroup check prevents an infinite redirect loop —
      // without it, this would keep firing even on the login screen itself.
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
      return;
    }

    // ── Session exists but profile not loaded yet ────────────────────────
    // AuthContext fetches the profile async after confirming the session.
    // We wait here so we don't redirect before we know the role.
    if (!profile) return;

    // ── Session + profile loaded → route by role ─────────────────────────
    // Only redirect if the user is currently on an auth screen.
    // If they're already on the right dashboard — do nothing.
    if (inAuthGroup) {
      if (profile.role === "student") {
        router.replace("/(student)");
      } else if (profile.role === "officer" || profile.role === "admin") {
        router.replace("/(officer)");
      }
    }
  }, [session, profile, loading, segments]);

  // Renders nothing — only manages navigation side effects
  return null;
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <AuthProvider>
      {/*
        NavigationGuard is inside AuthProvider so useAuth() works here.
        It centralises ALL navigation decisions in one place:
          - No session  → /(auth)/login
          - Student     → /(student)
          - Officer/Admin → /(officer)

        IMPORTANT: Because NavigationGuard handles redirects, you should
        REMOVE router.replace() from your login handler and logout handlers.
        Keeping them causes double-navigation races on some devices.
      */}
      <NavigationGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}