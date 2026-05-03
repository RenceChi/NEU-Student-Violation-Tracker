import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "Minor" | "Major" | "Severe";

interface MyViolation {
  id: string;
  severity: Severity;
  date_of_incident: string;
  status: string;
  description: string;
  violation_type: { name: string; category: string } | null;
  sanctions: { sanction: { name: string; duration: string } | null }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: Severity) => {
  switch (s) {
    case "Minor":  return { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" };
    case "Major":  return { bg: "#FEE9D9", text: "#9A3412", dot: "#F97316" };
    case "Severe": return { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" };
  }
};

const statusStyle = (s: string) => {
  switch (s) {
    case "resolved": return { bg: "#D1FAE5", text: "#065F46", icon: "checkmark-circle" as const };
    case "pending":  return { bg: "#FEF3C7", text: "#92400E", icon: "time" as const };
    case "appealed": return { bg: "#DBEAFE", text: "#1E40AF", icon: "chatbubble-ellipses" as const };
    default:         return { bg: "#F1F5F9", text: "#475569", icon: "ellipsis-horizontal" as const };
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Violation Card ───────────────────────────────────────────────────────────

function ViolationCard({
  item,
  onAppeal,
}: {
  item: MyViolation;
  onAppeal: (id: string) => void;
}) {
  const sv = severityStyle(item.severity);
  const st = statusStyle(item.status);
  const [expanded, setExpanded] = useState(false);
  const canAppeal = item.status === "pending";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        overflow: "hidden",
      }}
    >
      {/* Severity bar */}
      <View style={{ height: 4, backgroundColor: sv.dot }} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded((e) => !e)}
        style={{ padding: 14 }}
      >
        {/* Header row */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", flex: 1, marginRight: 8 }} numberOfLines={1}>
            {item.violation_type?.name ?? "Violation"}
          </Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
        </View>

        {/* Badges */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: sv.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sv.dot }} />
            <Text style={{ fontSize: 10, fontWeight: "700", color: sv.text }}>{item.severity.toUpperCase()}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: st.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Ionicons name={st.icon} size={10} color={st.text} />
            <Text style={{ fontSize: 10, fontWeight: "700", color: st.text }}>{item.status.toUpperCase()}</Text>
          </View>

          <Text style={{ fontSize: 11, color: "#94A3B8", marginLeft: "auto" }}>
            {formatDate(item.date_of_incident)}
          </Text>
        </View>

        {/* Expanded */}
        {expanded && (
          <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12, gap: 10 }}>
            {!!item.description && (
              <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 20 }}>{item.description}</Text>
            )}

            {/* Sanctions */}
            {item.sanctions?.length > 0 && (
              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>
                  SANCTIONS
                </Text>
                {item.sanctions.filter(s => !!s.sanction).map((s, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: "#F8FAFC",
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 4,
                    }}
                  >
                    <Ionicons name="alert-circle-outline" size={14} color="#F97316" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{s.sanction!.name}</Text>
                      {!!s.sanction!.duration && (
                        <Text style={{ fontSize: 11, color: "#94A3B8" }}>Duration: {s.sanction!.duration}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Appeal button */}
            {canAppeal && (
              <TouchableOpacity
                onPress={() => onAppeal(item.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: "#EFF6FF",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginTop: 4,
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#1E40AF" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E40AF" }}>Submit Appeal</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();

  const [violations, setViolations] = useState<MyViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!profile?.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("student_violations")
        .select(`
          id, severity, date_of_incident, status, description,
          violation_type:violation_type_id(name, category),
          sanctions:violation_sanctions(sanction:sanction_id(name, duration))
        `)
        .eq("student_id", profile.id)
        .order("date_of_incident", { ascending: false });

      if (!error) setViolations((data as any) ?? []);
      setLoading(false);
    };
    fetch();
  }, [profile?.id]);

  const handleAppeal = (violationId: string) => {
    Alert.alert(
      "Submit Appeal",
      "Are you sure you want to submit an appeal for this violation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            // Insert into appeals table
            const { error: appealError } = await supabase
              .from("appeals")
              .insert({
                violation_id: violationId,
                student_id: profile?.id,
                reason: "Student appeal",
                status: "pending",
              });

            if (appealError) {
              Alert.alert("Error", appealError.message);
              return;
            }

            // Update violation status to appealed
            const { error: statusError } = await supabase
              .from("student_violations")
              .update({ status: "appealed" })
              .eq("id", violationId);

            if (statusError) {
              Alert.alert("Error", statusError.message);
              return;
            }

            setViolations((prev) =>
              prev.map((v) => (v.id === violationId ? { ...v, status: "appealed" } : v))
            );
            Alert.alert("Appeal Submitted", "Your appeal has been submitted and is under review.");
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  // Stats
  const pending  = violations.filter((v) => v.status === "pending").length;
  const resolved = violations.filter((v) => v.status === "resolved").length;
  const appealed = violations.filter((v) => v.status === "appealed").length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: "#1E293B",
          paddingTop: insets.top + 12,
          paddingBottom: 28,
          paddingHorizontal: 20,
        }}
      >
        {/* Top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
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
                STUDENT PORTAL
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

        {/* Student info */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#F59E0B",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
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

        {/* ── Status Summary ── */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
          MY RECORD
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {[
            { label: "TOTAL",    value: violations.length, bg: "#1E293B", textColor: "#fff" },
            { label: "PENDING",  value: pending,           bg: "#FEF3C7", textColor: "#92400E" },
            { label: "RESOLVED", value: resolved,          bg: "#D1FAE5", textColor: "#065F46" },
            { label: "APPEALED", value: appealed,          bg: "#DBEAFE", textColor: "#1E40AF" },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: s.bg,
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
              }}
            >
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

        {/* ── Info banner ── */}
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderWidth: 1,
            borderColor: "#BFDBFE",
            borderRadius: 12,
            padding: 14,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <Ionicons name="information-circle-outline" size={18} color="#1E40AF" style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 12, color: "#1E40AF", flex: 1, lineHeight: 18 }}>
            You can submit an appeal on any pending violation. Tap a violation card to expand details and manage your appeal.
          </Text>
        </View>

        {/* ── Violations ── */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
          VIOLATION HISTORY
        </Text>

        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : violations.length === 0 ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              padding: 40,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#D1FAE5",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Ionicons name="checkmark-circle" size={36} color="#065F46" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 6 }}>
              Clean Record
            </Text>
            <Text style={{ fontSize: 13, color: "#94A3B8", textAlign: "center" }}>
              You have no violations on record. Keep it up!
            </Text>
          </View>
        ) : (
          violations.map((v) => (
            <ViolationCard key={v.id} item={v} onAppeal={handleAppeal} />
          ))
        )}
      </ScrollView>
    </View>
  );
}