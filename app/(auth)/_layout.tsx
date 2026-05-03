import { Stack } from "expo-router";

// AuthProvider lives in the root app/_layout.tsx — do NOT wrap again here.
// A second AuthProvider would create a separate context instance causing
// useAuth() calls inside auth screens to see a different (empty) state.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}