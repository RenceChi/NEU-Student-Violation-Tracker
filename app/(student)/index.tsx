import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  total: number;
  pending: number;
  resolved: number;
  appealed: number;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StudentHome() {
  const insets      = useSafeAreaInsets();
  const router      = useRouter();
  const { profile } = useAuth();

  const [stats,   setStats]   = useState<Stats>({ total: 0, pending: 0, resolved: 0, appealed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("student_violations")
        .select("id, status")
        .eq("student_id", profile.id);

      if (!error && data) {
        setStats({
          total:    data.length,
          pending:  data.filter((v) => v.status === "pending").length,
          resolved: data.filter((v) => v.status === "resolved").length,
          appealed: data.filter((v) => v.status === "appealed").length,
        });
      }
      setLoading(false);
    };
    fetchStats();
  }, [profile?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* ── Header ── */}
      <View style={{
        backgroundColor: "#1E293B",
        paddingTop: insets.top + 12,
        paddingBottom: 28,
        paddingHorizontal: 20,
      }}>
        {/* Top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: "#F59E0B",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
            </View>
            <View>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>EduGuard</Text>
              <Text style={{ color: "#94A3B8", fontSize: 10, fontWeight: "600", letterSpacing: 1 }}>
                STUDENT PORTAL
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              backgroundColor: "rgba(255,255,255,0.08)",
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
            }}
          >
            <Ionicons name="log-out-outline" size={15} color="#94A3B8" />
            <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "600" }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Student info */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: "#F59E0B",
            alignItems: "center", justifyContent: "center",
            borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
          }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
              {profile?.full_name
                ? profile.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                : "S"}
            </Text>
          </View>
          <View>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
              {profile?.full_name ?? "Student"}
            </Text>
            {profile?.student_id && (
              <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}>
                ID: #{profile.student_id}
                {profile?.section ? ` · Section ${profile.section}` : ""}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        {/* ── My Record ── */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
          MY RECORD
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {[
            { label: "TOTAL",    value: stats.total,    bg: "#1E293B", textColor: "#fff"     },
            { label: "PENDING",  value: stats.pending,  bg: "#FEF3C7", textColor: "#92400E"  },
            { label: "RESOLVED", value: stats.resolved, bg: "#D1FAE5", textColor: "#065F46"  },
            { label: "APPEALED", value: stats.appealed, bg: "#DBEAFE", textColor: "#1E40AF"  },
          ].map((s) => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: s.bg,
              borderRadius: 12, padding: 12, alignItems: "center",
            }}>
              {loading ? (
                <ActivityIndicator size="small" color={s.textColor} />
              ) : (
                <Text style={{ fontSize: 20, fontWeight: "800", color: s.textColor }}>{s.value}</Text>
              )}
              <Text style={{ fontSize: 9, fontWeight: "700", color: s.textColor, opacity: 0.7, marginTop: 2 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
          QUICK ACTIONS
        </Text>

        <View style={{ gap: 10, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.navigate("/(student)/violations")}
            style={{
              backgroundColor: "#fff", borderRadius: 12, padding: 16,
              flexDirection: "row", alignItems: "center", gap: 14,
              shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 }, elevation: 2,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 10,
              backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="document-text" size={20} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B" }}>My Violations</Text>
              <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Check history and details</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.navigate("/(student)/appeals")}
            style={{
              backgroundColor: "#fff", borderRadius: 12, padding: 16,
              flexDirection: "row", alignItems: "center", gap: 14,
              shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 }, elevation: 2,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 10,
              backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#1E40AF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B" }}>My Appeals</Text>
              <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Track active appeal status</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* ── Info banner ── */}
        <View style={{
          backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE",
          borderRadius: 12, padding: 14,
          flexDirection: "row", alignItems: "flex-start", gap: 10,
        }}>
          <Ionicons name="information-circle-outline" size={18} color="#1E40AF" style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 12, color: "#1E40AF", flex: 1, lineHeight: 18 }}>
            You can submit an appeal on any pending violation. Go to your Violations tab to view details and manage appeals.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}