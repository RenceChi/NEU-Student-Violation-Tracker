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

  // ── ITEM 3: Sign-up state ──────────────────────────────────────────────────
  // These track whether we're in sign-up mode and the extra fields needed.
  const [isSignUp, setIsSignUp]         = useState(false);
  const [fullName, setFullName]         = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);

  const router  = useRouter();

  // useSafeAreaInsets gives us the exact pixel height of system UI elements.
  // insets.top = status bar height, insets.bottom = nav bar height.
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

    // Step 1: Sign in with Supabase Auth
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

    // Step 2: Fetch the user's role from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      // Auth succeeded but no profile row exists — block access and sign out
      await supabase.auth.signOut();
      Alert.alert(
        "Account Error",
        "Your account profile could not be loaded. Please contact your administrator.",
      );
      setLoading(false);
      return;
    }

    // Step 3: Navigation is handled by NavigationGuard in app/_layout.tsx.
    // When signInWithPassword succeeds, AuthContext fires onAuthStateChange,
    // sets session + profile, and NavigationGuard redirects to the correct
    // dashboard automatically. No router.replace() needed here.
    //
    // We still block unknown roles explicitly for security.
    if (profile.role !== "student" && profile.role !== "officer" && profile.role !== "admin") {
      await supabase.auth.signOut();
      Alert.alert(
        "Access Denied",
        "Your account does not have a valid role assigned. Contact your administrator.",
      );
    }

    setLoading(false);
  }

  // ── ITEM 3: Sign Up ────────────────────────────────────────────────────────
  // Creates a new Supabase Auth user and inserts a matching profile row.
  // NOTE: New accounts are created with role = "student" by default.
  // An admin must manually change the role in Supabase for officer/admin accounts.

  async function handleSignUp() {
    const email = identifier.trim();

    if (!fullName.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }

    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setSignUpLoading(true);

    // Step 1: Create the auth user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass full_name so the database trigger can use it when
        // auto-creating the profile row (if your DB has that trigger).
        data: { full_name: fullName.trim() },
      },
    });

    if (signUpError) {
      Alert.alert("Sign Up Failed", signUpError.message);
      setSignUpLoading(false);
      return;
    }

    if (!data.user) {
      Alert.alert(
        "Sign Up Failed",
        "Could not create your account. Please try again.",
      );
      setSignUpLoading(false);
      return;
    }

    // Step 2: Update full_name on the profile row the DB trigger just created.
    //
    // WHY UPDATE and not INSERT/UPSERT:
    // Your DB trigger fires on auth.users INSERT and auto-creates the profile.
    // But triggers don't read raw_user_meta_data by default, so full_name is
    // null after signup. We UPDATE the existing row to write the name entered.
    //
    // The 800ms delay gives the trigger time to create the row first.
    // Without it, the UPDATE runs before the row exists and does nothing.
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })  // Only update the name field
      .eq("id", data.user.id);                 // On the row the trigger created

    if (profileError) {
      // Log but don't block — account was created, only display name is affected.
      console.error("[SignUp] Profile name update failed:", profileError.message);
    }

    setSignUpLoading(false);

    Alert.alert(
      "Account Created",
      "Your account has been created. You can now sign in.",
      [{ text: "OK", onPress: () => setIsSignUp(false) }],
    );

    // Clear the form fields after successful sign-up
    setFullName("");
    setIdentifier("");
    setPassword("");
  }

  // ── Forgot Password ────────────────────────────────────────────────────────

  async function handleForgotPassword() {
    const email = identifier.trim();

    if (!email) {
      Alert.alert(
        "Enter Your Email",
        "Type your email address in the field above, then tap Forgot Password.",
      );
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address first.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "eduguard://reset-password",
    });

    setResetLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Reset Email Sent",
        `A password reset link has been sent to ${email}. Check your inbox.`,
      );
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
        {/* ITEM 1 FIX: paddingBottom now includes insets.bottom so the form  */}
        {/* never hides behind the Android 3-button navigation bar.           */}
        <View style={{
          flex: 1,
          backgroundColor: "#fff",
          paddingHorizontal: 28,
          paddingTop: 32,
          paddingBottom: Math.max(32, insets.bottom + 24),
        }}>

          {/* ── Mode toggle: Sign In / Sign Up ── */}
          {/* ITEM 3: Tabs let the user switch between login and sign-up modes */}
          <View style={{
            flexDirection: "row",
            backgroundColor: "#F1F5F9",
            borderRadius: 8,
            padding: 4,
            marginBottom: 28,
          }}>
            <TouchableOpacity
              onPress={() => setIsSignUp(false)}
              style={{
                flex: 1, paddingVertical: 8, alignItems: "center",
                borderRadius: 6,
                backgroundColor: !isSignUp ? "#1E293B" : "transparent",
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: "700",
                color: !isSignUp ? "#fff" : "#64748B",
              }}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsSignUp(true)}
              style={{
                flex: 1, paddingVertical: 8, alignItems: "center",
                borderRadius: 6,
                backgroundColor: isSignUp ? "#1E293B" : "transparent",
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: "700",
                color: isSignUp ? "#fff" : "#64748B",
              }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Full Name (sign-up only) ── */}
          {/* Only shown when isSignUp is true */}
          {isSignUp && (
            <>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>
                FULL NAME
              </Text>
              <View style={{
                flexDirection: "row", alignItems: "center",
                borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8,
                paddingHorizontal: 14, marginBottom: 20,
              }}>
                <Feather name="user" size={16} color="#F59E0B" style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                  placeholderTextColor="#CBD5E1"
                  style={{ flex: 1, paddingVertical: 14, fontSize: 14, color: "#1E293B" }}
                />
              </View>
            </>
          )}

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
            {/* Only show Forgot Password in sign-in mode */}
            {!isSignUp && (
              <TouchableOpacity onPress={handleForgotPassword} disabled={resetLoading} hitSlop={8}>
                {resetLoading
                  ? <ActivityIndicator size="small" color="#F59E0B" />
                  : <Text style={{ fontSize: 12, fontWeight: "600", color: "#F59E0B" }}>Forgot Password?</Text>
                }
              </TouchableOpacity>
            )}
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

          {/* ── Primary action button (Login or Sign Up) ── */}
          <TouchableOpacity
            onPress={isSignUp ? handleSignUp : handleLogin}
            disabled={loading || signUpLoading}
            style={{
              backgroundColor: (loading || signUpLoading) ? "#475569" : "#1E293B",
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {(loading || signUpLoading)
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                    {isSignUp ? "Create Account" : "Login"}
                  </Text>
                  <Feather name={isSignUp ? "user-plus" : "log-in"} size={16} color="#fff" />
                </>
            }
          </TouchableOpacity>

          {/* Footer */}
          <Text style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", lineHeight: 16, marginBottom: 16 }}>
            {isSignUp
              ? "New accounts are reviewed by administrators.\nRole access is assigned after verification."
              : "Access is restricted to authorized personnel.\nYour activity is being monitored for compliance."
            }
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