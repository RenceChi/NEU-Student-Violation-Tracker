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
import { useGoogleAuth } from "../../src/lib/googleAuth";
import { supabase } from "../../src/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidEmail = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [identifier, setIdentifier]     = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  // ── Login ──────────────────────────────────────────────────────────────────

  async function handleLogin() {
    const email = identifier.trim();

    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // Step 1: Sign in
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      Alert.alert(
        "Login Failed",
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : authError.message,
      );
      setLoading(false);
      return;
    }

    // Step 2: Fetch role — handle failure gracefully
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      // Auth succeeded but profile is missing — sign out and show error
      await supabase.auth.signOut();
      Alert.alert(
        "Account Error",
        "Your account profile could not be loaded. Please contact your administrator.",
      );
      setLoading(false);
      return;
    }

    // Step 3: Route by role
    if (profile.role === "student") {
      router.replace("/(student)");
    } else if (profile.role === "officer" || profile.role === "admin") {
      router.replace("/(officer)");
    } else {
      // Unknown role — sign out and block access
      await supabase.auth.signOut();
      Alert.alert(
        "Access Denied",
        "Your account does not have a valid role assigned. Contact your administrator.",
      );
    }

    setLoading(false);
  }

  // ── Forgot Password ────────────────────────────────────────────────────────

  async function handleForgotPassword() {
    const email = identifier.trim();

    if (!email) {
      Alert.alert("Enter Your Email", "Type your email address in the field above, then tap Forgot Password.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address first.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "neustudentviolationtracker://reset-password",
    });

    setResetLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Reset Email Sent", `A password reset link has been sent to ${email}. Check your inbox.`);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const anyLoading = loading || signUpLoading || googleLoading;

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

        {/* ── Form card ── */}
        <View style={{
          flex: 1,
          backgroundColor: "#fff",
          paddingHorizontal: 28,
          paddingTop: 32,
          paddingBottom: 32,
        }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#1E293B", marginBottom: 28 }}>
            Sign In
          </Text>

          {/* Email */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>
            EMAIL
          </Text>
          <View style={{
            flexDirection: "row", alignItems: "center",
            borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8,
            paddingHorizontal: 14, marginBottom: 20,
          }}>
            <Feather name="mail" size={16} color="#F59E0B" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Enter your email"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholderTextColor="#CBD5E1"
              style={{ flex: 1, paddingVertical: 14, fontSize: 14, color: "#1E293B" }}
            />
          </View>

          {/* Password */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1 }}>
              PASSWORD
            </Text>
            <TouchableOpacity onPress={handleForgotPassword} disabled={resetLoading} hitSlop={8}>
              {resetLoading
                ? <ActivityIndicator size="small" color="#F59E0B" />
                : <Text style={{ fontSize: 12, fontWeight: "600", color: "#F59E0B" }}>Forgot Password?</Text>
              }
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
              autoComplete="password"
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
              backgroundColor: loading ? "#475569" : "#1E293B",
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              marginBottom: 16,
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

          {/* ── Google Sign-In Button (Sign In mode only) ── */}
          {!isSignUp && (
            <TouchableOpacity
              onPress={() => googlePrompt()}
              disabled={anyLoading}
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {googleLoading
                ? <ActivityIndicator color="#1E293B" />
                : <>
                    <Feather name="globe" size={16} color="#1E293B" />
                    <Text style={{ color: "#1E293B", fontWeight: "700", fontSize: 15 }}>
                      Sign in with Google
                    </Text>
                  </>
              }
            </TouchableOpacity>
          )}

          {/* Footer */}
          <Text style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", lineHeight: 16, marginBottom: 16 }}>
            Access is restricted to authorized personnel.{"\n"}Your activity is being monitored for compliance.
          </Text>

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