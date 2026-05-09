import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "Minor" | "Major" | "Severe";
type StatusFilter = "all" | "pending" | "resolved" | "appealed";

interface Violation {
  id: string;
  severity: Severity;
  date_of_incident: string;
  time_of_incident?: string;
  location?: string;
  description: string;
  status: string;
  student: { full_name: string; student_id?: string; section?: string } | null;
  violation_type: { name: string; category: string } | null;
  recorder: { full_name: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: Severity) => {
  switch (s) {
    case "Minor": return { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" };
    case "Major": return { bg: "#FEE9D9", text: "#9A3412", dot: "#F97316" };
    case "Severe": return { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" };
  }
};

const statusStyle = (s: string) => {
  switch (s) {
    case "resolved": return { bg: "#D1FAE5", text: "#065F46" };
    case "pending": return { bg: "#FEF3C7", text: "#92400E" };
    case "appealed": return { bg: "#DBEAFE", text: "#1E40AF" };
    case "overturned": return { bg: "#F3E8FF", text: "#6B21A8" };
    default: return { bg: "#F1F5F9", text: "#475569" };
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// ─── Violation Row ────────────────────────────────────────────────────────────

function ViolationRow({ item, router }: { item: Violation; router: ReturnType<typeof useRouter> }) {
  const sv = severityStyle(item.severity);
  const st = statusStyle(item.status);
  const [expanded, setExpanded] = useState(false);

  const canAssignSanction = item.status === "pending";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 8,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        overflow: "hidden",
      }}
    >
      {/* Severity stripe */}
      <View style={{ height: 3, backgroundColor: sv.dot }} />

      {/* Tappable header area */}
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.85}
        style={{ padding: 14 }}
      >
        {/* Top row */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "#1E293B",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                {initials(item.student?.full_name ?? "?")}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 1 }} numberOfLines={1}>
                {item.student?.full_name ?? "Unknown"}
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8" }} numberOfLines={1}>
                {item.student?.student_id ? `#${item.student.student_id}` : ""}
                {item.student?.section ? ` · Sec ${item.student.section}` : ""}
              </Text>
            </View>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#94A3B8"
            style={{ marginLeft: 8, flexShrink: 0 }}
          />
        </View>

        {/* Violation type */}
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 8 }} numberOfLines={1}>
          {item.violation_type?.name ?? "—"}
        </Text>

        {/* Badges row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: sv.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sv.dot }} />
            <Text style={{ fontSize: 10, fontWeight: "700", color: sv.text }}>{item.severity.toUpperCase()}</Text>
          </View>
          <View style={{ backgroundColor: st.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: st.text }}>{item.status.toUpperCase()}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" }}>
            <Ionicons name="calendar-outline" size={11} color="#94A3B8" />
            <Text style={{ fontSize: 11, color: "#94A3B8" }}>{formatDate(item.date_of_incident)}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded details — outside TouchableOpacity so buttons are tappable */}
      {expanded && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
          {!!item.location && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
              <Ionicons name="location-outline" size={13} color="#94A3B8" />
              <Text style={{ fontSize: 12, color: "#64748B" }}>{item.location}</Text>
            </View>
          )}
          {!!item.description && (
            <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>{item.description}</Text>
          )}
          {!!item.recorder && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="person-outline" size={13} color="#94A3B8" />
              <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
                Recorded by {item.recorder.full_name}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <TouchableOpacity
              onPress={() => {
                setExpanded(false);
                router.push({
                  pathname: "/(officer)/violation/[id]" as any,
                  params: { id: item.id },
                });
              }}
              style={{
                flex: 1,
                flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
                backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 11,
                borderWidth: 1, borderColor: "#E2E8F0",
              }}
            >
              <Ionicons name="eye-outline" size={15} color="#475569" />
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569" }}>View Details</Text>
            </TouchableOpacity>

            {canAssignSanction && (
              <TouchableOpacity
                onPress={() => {
                  setExpanded(false);
                  router.push({
                    pathname: "/(officer)/violation/assign-sanction" as any,
                    params: { id: item.id },
                  });
                }}
                style={{
                  flex: 1,
                  flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
                  backgroundColor: "#1E293B", borderRadius: 10, paddingVertical: 11,
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={15} color="#F59E0B" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Assign Sanction</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "appealed", label: "Appealed" },
];

const SEVERITY_FILTERS: { key: Severity | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Minor", label: "Minor" },
  { key: "Major", label: "Major" },
  { key: "Severe", label: "Severe" },
];

export default function ViolationHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");

  const doFetch = async (
    status: StatusFilter,
    severity: Severity | "all",
    silent: boolean,
  ) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    let query = supabase
      .from("student_violations")
      .select(`
        id, severity, date_of_incident, time_of_incident, location, description, status,
        student:student_id(full_name, student_id, section),
        violation_type:violation_type_id(name, category),
        recorder:recorded_by(full_name)
      `)
      .order("date_of_incident", { ascending: false });

    if (status !== "all") query = query.eq("status", status);
    if (severity !== "all") query = query.eq("severity", severity);

    const { data, error } = await query;
    if (!error) setViolations((data as any) ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    doFetch(statusFilter, severityFilter, false);
  }, [statusFilter, severityFilter]);

  const handleRefresh = () => doFetch(statusFilter, severityFilter, true);

  const filtered = violations.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.student?.full_name?.toLowerCase().includes(q) ||
      v.student?.student_id?.toLowerCase().includes(q) ||
      v.violation_type?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* Header */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>Violations</Text>
          <View style={{ backgroundColor: "#F59E0B", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              {loading ? "—" : filtered.length}
            </Text>
          </View>
        </View>

        {/* Status filter pills */}
        <View style={{ flexDirection: "row", gap: 8, paddingBottom: 14 }}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setStatusFilter(f.key)}
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                backgroundColor: statusFilter === f.key ? "#F59E0B" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: statusFilter === f.key ? "#fff" : "#94A3B8" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search + severity filter */}
      <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        {/* Search bar */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0",
          borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10,
        }}>
          <Ionicons name="search-outline" size={16} color="#F59E0B" style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search student name or ID..."
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, fontSize: 14, color: "#1E293B" }}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Severity pills */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          {SEVERITY_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setSeverityFilter(f.key)}
              style={{
                paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
                backgroundColor:
                  severityFilter === f.key
                    ? f.key === "all" ? "#1E293B"
                      : f.key === "Minor" ? "#F59E0B"
                        : f.key === "Major" ? "#F97316"
                          : "#EF4444"
                    : "#fff",
                borderWidth: 1,
                borderColor: severityFilter === f.key ? "transparent" : "#E2E8F0",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: severityFilter === f.key ? "#fff" : "#64748B" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <ViolationRow item={item} router={router} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 64 }}>
              <Ionicons name="document-text-outline" size={52} color="#CBD5E1" />
              <Text style={{ color: "#94A3B8", marginTop: 12, fontSize: 14 }}>
                {search ? "No results found." : "No violations recorded yet."}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(officer)/record")}
        style={{
          position: "absolute", bottom: 24 + insets.bottom, right: 20,
          flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: "#F59E0B", borderRadius: 28,
          paddingHorizontal: 20, paddingVertical: 14,
          shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 }, elevation: 6,
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Record</Text>
      </TouchableOpacity>
    </View>
  );
}