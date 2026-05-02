import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function handleLogin() {
    if (!identifier || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) {
      Alert.alert("Login Failed", error.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "student") {
      router.replace("/(student)");
    } else {
      router.replace("/(officer)");
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top navy section ── */}
        <View style={{
          backgroundColor: "#1E293B",
          paddingTop: insets.top + 48,
          paddingBottom: 48,
          alignItems: "center",
        }}>
          {/* Shield icon */}
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: "rgba(255,255,255,0.12)",
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
          </View>

          <Text style={{ fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 4 }}>
            EduGuard
          </Text>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#F59E0B", letterSpacing: 2 }}>
            SCHOOL DISCIPLINARY MANAGEMENT
          </Text>
        </View>

        {/* ── White form card ── */}
        <View style={{
          flex: 1,
          backgroundColor: "#fff",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          paddingHorizontal: 28,
          paddingTop: 32,
          paddingBottom: 32,
        }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#1E293B", marginBottom: 28 }}>
            Sign In
          </Text>

          {/* Username */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>
            USERNAME
          </Text>
          <View style={{
            flexDirection: "row", alignItems: "center",
            borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8,
            paddingHorizontal: 14, marginBottom: 20,
          }}>
            <Feather name="user" size={16} color="#F59E0B" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Enter your username"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#CBD5E1"
              style={{ flex: 1, paddingVertical: 14, fontSize: 14, color: "#1E293B" }}
            />
          </View>

          {/* Password */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1 }}>
              PASSWORD
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#F59E0B" }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={{
            flexDirection: "row", alignItems: "center",
            borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8,
            paddingHorizontal: 14, marginBottom: 28,
          }}>
            <Feather name="lock" size={16} color="#F59E0B" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#CBD5E1"
              style={{ flex: 1, paddingVertical: 14, fontSize: 14, color: "#1E293B" }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: "#1E293B",
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Login</Text>
                  <Feather name="log-in" size={16} color="#fff" />
                </>
            }
          </TouchableOpacity>

          {/* Footer note */}
          <Text style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", lineHeight: 16, marginBottom: 16 }}>
            Access is restricted to authorized personnel. Your activity is{"\n"}being monitored for compliance.
          </Text>

          {/* Verified system badge */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" }} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1 }}>
              VERIFIED SYSTEM
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}