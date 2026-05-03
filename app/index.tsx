import { useAuth } from "@/src/lib/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

// Root index reads from AuthContext which already fetched the session + profile
// on mount — no redundant Supabase calls needed here.
export default function Index() {
  const { session, profile, loading } = useAuth();

  // Still initialising — show spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E293B" }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  // Not logged in
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Logged in — route by role
  if (profile?.role === "student") {
    return <Redirect href="/(student)" />;
  }

  // admin or officer both go to officer layout
  return <Redirect href="/(officer)" />;
}