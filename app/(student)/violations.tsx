import SubmitAppealModal from "@/components/SubmitAppealModal";
import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  hasAppeal?: boolean;
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
    case "resolved":   return { bg: "#D1FAE5", text: "#065F46", icon: "checkmark-circle"  as const };
    case "pending":    return { bg: "#FEF3C7", text: "#92400E", icon: "time"               as const };
    case "appealed":   return { bg: "#DBEAFE", text: "#1E40AF", icon: "chatbubble-ellipses" as const };
    case "overturned": return { bg: "#F3E8FF", text: "#6B21A8", icon: "refresh-circle"     as const };
    default:           return { bg: "#F1F5F9", text: "#475569", icon: "ellipsis-horizontal" as const };
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

// ─── Violation Card ───────────────────────────────────────────────────────────

function ViolationCard({
  item,
  onAppeal,
}: {
  item: MyViolation;
  onAppeal: (item: MyViolation) => void;
}) {
  const sv = severityStyle(item.severity);
  const st = statusStyle(item.status);
  const [expanded, setExpanded] = useState(false);

  // Appeal only on resolved violations that don't already have an appeal
  const canAppeal = item.status === "resolved" && !item.hasAppeal;

  return (
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 14,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      overflow: "hidden",
    }}>
      <View style={{ height: 4, backgroundColor: sv.dot }} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded((e) => !e)}
        style={{ padding: 14 }}
      >
        {/* Header */}
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
                  <View key={i} style={{
                    flexDirection: "row", alignItems: "center", gap: 8,
                    backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginBottom: 4,
                  }}>
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
                onPress={() => onAppeal(item)}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "center",
                  gap: 8, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE",
                  borderRadius: 10, paddingVertical: 12, marginTop: 4,
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#1E40AF" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E40AF" }}>Submit Appeal</Text>
              </TouchableOpacity>
            )}

            {/* Already appealed notice */}
            {item.status === "resolved" && item.hasAppeal && (
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                backgroundColor: "#EFF6FF", borderRadius: 10, padding: 12, marginTop: 4,
              }}>
                <Ionicons name="information-circle-outline" size={16} color="#1E40AF" />
                <Text style={{ fontSize: 12, color: "#1E40AF", flex: 1 }}>
                  You have already submitted an appeal for this violation.
                </Text>
              </View>
            )}

            {/* Overturned notice */}
            {item.status === "overturned" && (
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                backgroundColor: "#F3E8FF", borderRadius: 10, padding: 12, marginTop: 4,
                borderWidth: 1, borderColor: "#E9D5FF",
              }}>
                <Ionicons name="refresh-circle-outline" size={16} color="#6B21A8" />
                <Text style={{ fontSize: 12, color: "#6B21A8", flex: 1 }}>
                  Your appeal was approved. This violation has been overturned.
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StudentViolations() {
  const insets      = useSafeAreaInsets();
  const { profile } = useAuth();

  const [violations,   setViolations]   = useState<MyViolation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [appealTarget, setAppealTarget] = useState<MyViolation | null>(null);

  const fetchViolations = async (silent = false) => {
    if (!profile?.id) return;
    silent ? setRefreshing(true) : setLoading(true);

    const [violationsRes, appealsRes] = await Promise.all([
      supabase
        .from("student_violations")
        .select(`
          id, severity, date_of_incident, status, description,
          violation_type:violation_type_id(name, category),
          sanctions:violation_sanctions(sanction:sanction_id(name, duration))
        `)
        .eq("student_id", profile.id)
        .order("date_of_incident", { ascending: false }),
      supabase
        .from("appeals")
        .select("violation_id")
        .eq("student_id", profile.id),
    ]);

    if (!violationsRes.error) {
      const appealedIds = new Set((appealsRes.data ?? []).map((a) => a.violation_id));
      const enriched = (violationsRes.data as any[]).map((v) => ({
        ...v,
        hasAppeal: appealedIds.has(v.id),
      }));
      setViolations(enriched);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchViolations(); }, [profile?.id]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* Header */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>My Violations</Text>
          <View style={{ backgroundColor: "#F59E0B", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              {loading ? "—" : violations.length}
            </Text>
          </View>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={violations}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ViolationCard item={item} onAppeal={setAppealTarget} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => fetchViolations(true)}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 40, alignItems: "center" }}>
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: "#D1FAE5", alignItems: "center",
                justifyContent: "center", marginBottom: 14,
              }}>
                <Ionicons name="checkmark-circle" size={36} color="#065F46" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 6 }}>
                Clean Record
              </Text>
              <Text style={{ fontSize: 13, color: "#94A3B8", textAlign: "center" }}>
                You have no violations on record. Keep it up!
              </Text>
            </View>
          }
        />
      )}

      <SubmitAppealModal
        visible={!!appealTarget}
        violationId={appealTarget?.id ?? ""}
        violationName={appealTarget?.violation_type?.name ?? ""}
        severity={appealTarget?.severity ?? ""}
        date={appealTarget?.date_of_incident ?? ""}
        sanction={appealTarget?.sanctions?.[0]?.sanction?.name}
        onClose={() => setAppealTarget(null)}
        onSubmitted={() => {
          setAppealTarget(null);
          fetchViolations();
        }}
      />
    </View>
  );
}