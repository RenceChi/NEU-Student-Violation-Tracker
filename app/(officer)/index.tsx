import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,           // ← ITEM 2: needed for logout confirmation dialog
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "Minor" | "Major" | "Severe";

interface RecentViolation {
  id: string;
  severity: Severity;
  date_of_incident: string;
  status: string;
  student: { full_name: string; student_id?: string } | null;
  violation_type: { name: string } | null;
}

interface Stats {
  total: number;
  pending: number;
  thisWeek: number;
  severe: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityColor = (s: Severity) => {
  switch (s) {
    case "Minor": return "#F59E0B";
    case "Major": return "#F97316";
    case "Severe": return "#EF4444";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "resolved": return { bg: "#D1FAE5", text: "#065F46" };
    case "pending": return { bg: "#FEF3C7", text: "#92400E" };
    case "appealed": return { bg: "#DBEAFE", text: "#1E40AF" };
    default: return { bg: "#F1F5F9", text: "#475569" };
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  loading: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: accent + "1A",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#94A3B8" style={{ alignSelf: "flex-start" }} />
      ) : (
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E293B", marginBottom: 2 }}>
          {value}
        </Text>
      )}
      <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

function QuickAction({
  label,
  icon,
  onPress,
  accent,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accent?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: accent ?? "#F8FAFC",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: "center",
        gap: 8,
        borderWidth: accent ? 0 : 1,
        borderColor: "#E2E8F0",
      }}
    >
      <Ionicons name={icon} size={22} color={accent ? "#fff" : "#1E293B"} />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: accent ? "#fff" : "#1E293B",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OfficerDashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = profile?.role === "admin";

  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, thisWeek: 0, severe: 0 });
  const [recent, setRecent] = useState<RecentViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const [totalRes, pendingRes, weekRes, severeRes, recentRes] = await Promise.all([
        supabase.from("student_violations").select("id", { count: "exact", head: true }),
        supabase.from("student_violations").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("student_violations").select("id", { count: "exact", head: true }).gte("date_of_incident", weekAgoStr),
        supabase.from("student_violations").select("id", { count: "exact", head: true }).eq("severity", "Severe"),
        supabase
          .from("student_violations")
          .select(`id, severity, date_of_incident, status, student:student_id(full_name, student_id), violation_type:violation_type_id(name)`)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        total: totalRes.count ?? 0,
        pending: pendingRes.count ?? 0,
        thisWeek: weekRes.count ?? 0,
        severe: severeRes.count ?? 0,
      });
      setRecent((recentRes.data as any) ?? []);
      setLoading(false);
    };

    fetchData();
  }, []);

  // ── ITEM 2: Logout with confirmation ────────────────────────────────────────
  // Shows a native Alert before signing out. No manual router.replace() needed
  // — AuthContext detects session = null and root _layout.tsx redirects to login.
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive", // Renders red on iOS
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", "Could not log out. Please try again.");
            }
          },
        },
      ],
    );
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: "#1E293B",
          paddingTop: insets.top + 12,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {/* Logo mark */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "#F59E0B",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
            </View>
            <View>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>EduGuard</Text>
              <Text style={{ color: "#94A3B8", fontSize: 10, fontWeight: "600", letterSpacing: 1 }}>
                {isAdmin ? "ADMINISTRATOR" : "DISCIPLINE OFFICER"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(255,255,255,0.08)",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="log-out-outline" size={15} color="#94A3B8" />
            <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "600" }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <Text style={{ color: "#94A3B8", fontSize: 13, marginBottom: 2 }}>{greeting()},</Text>
        {profile?.full_name ? (
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>
            {profile.full_name}
          </Text>
        ) : (
          <View style={{ height: 28, width: 160, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 6 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >

        {/* ── Stats ── */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
          OVERVIEW
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <StatCard label="TOTAL" value={stats.total} icon="document-text" accent="#6366F1" loading={loading} />
          <StatCard label="PENDING" value={stats.pending} icon="time" accent="#F59E0B" loading={loading} />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          <StatCard label="THIS WEEK" value={stats.thisWeek} icon="calendar" accent="#1D9E75" loading={loading} />
          <StatCard label="SEVERE" value={stats.severe} icon="warning" accent="#EF4444" loading={loading} />
        </View>

        {/* ── Quick Actions ── */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
          QUICK ACTIONS
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          <QuickAction
            label="Record Violation"
            icon="add-circle"
            accent="#1E293B"
            onPress={() => router.push("/(officer)/record")}
          />
          <QuickAction
            label="View History"
            icon="document-text-outline"
            onPress={() => router.navigate("/(officer)/history")}
          />
          <QuickAction
            label="Library"
            icon="library-outline"
            onPress={() => router.navigate("/(officer)/library")}
          />
          {isAdmin && (
            <QuickAction
              label="Reports"
              icon="bar-chart-outline"
              onPress={() => router.navigate("/(officer)/report")}
            />
          )}
        </View>

        {/* ── Recent Violations ── */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1 }}>
            RECENT VIOLATIONS
          </Text>
          <TouchableOpacity onPress={() => router.navigate("/(officer)/history")}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#F59E0B" }}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : recent.length === 0 ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 32,
              alignItems: "center",
            }}
          >
            <Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
            <Text style={{ color: "#94A3B8", marginTop: 10, fontSize: 14 }}>No violations recorded yet.</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {recent.map((v) => {
              const sc = statusColor(v.status);
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => router.navigate("/(officer)/history")}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    shadowColor: "#000",
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 1,
                  }}
                >
                  {/* Avatar */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#1E293B",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                      {initials(v.student?.full_name ?? "?")}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 2 }}
                      numberOfLines={1}
                    >
                      {v.student?.full_name ?? "Unknown"}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#64748B" }} numberOfLines={1}>
                      {v.violation_type?.name ?? "—"}
                    </Text>
                  </View>

                  {/* Right side */}
                  <View style={{ alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    {/* Severity dot */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: severityColor(v.severity),
                        }}
                      />
                      <Text style={{ fontSize: 11, fontWeight: "700", color: severityColor(v.severity) }}>
                        {v.severity}
                      </Text>
                    </View>

                    {/* Status badge */}
                    <View
                      style={{
                        backgroundColor: sc.bg,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: "700", color: sc.text }}>
                        {v.status.toUpperCase()}
                      </Text>
                    </View>

                    <Text style={{ fontSize: 10, color: "#94A3B8" }}>
                      {timeAgo(v.date_of_incident)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}