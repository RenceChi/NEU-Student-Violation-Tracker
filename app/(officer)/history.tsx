<<<<<<< HEAD
=======
import { useAuth } from "@/src/lib/context/AuthContext";
>>>>>>> origin/dev
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
<<<<<<< HEAD
=======
  Alert,
>>>>>>> origin/dev
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "Minor" | "Major" | "Severe";
<<<<<<< HEAD
type StatusFilter = "all" | "pending" | "resolved" | "appealed";
=======
type Status = "pending" | "open" | "resolved";
type FilterType = "All" | "By Date" | "By Type" | "By Severity";
>>>>>>> origin/dev

interface Violation {
  id: string;
  severity: Severity;
<<<<<<< HEAD
  date_of_incident: string;
  time_of_incident?: string;
  location?: string;
  description: string;
  status: string;
  student: { full_name: string; student_id?: string; section?: string } | null;
  violation_type: { name: string; category: string } | null;
  recorder: { full_name: string } | null;
=======
  status: Status;
  date_of_incident: string;
  time_of_incident: string;
  location: string;
  description: string;
  created_at: string;
  student: { id: string; full_name: string; student_id: string; section: string };
  violation_type: { name: string; category: string };
  recorder: { full_name: string };
>>>>>>> origin/dev
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: Severity) => {
  switch (s) {
<<<<<<< HEAD
    case "Minor":  return { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" };
    case "Major":  return { bg: "#FEE9D9", text: "#9A3412", dot: "#F97316" };
    case "Severe": return { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" };
  }
};

const statusStyle = (s: string) => {
  switch (s) {
    case "resolved": return { bg: "#D1FAE5", text: "#065F46" };
    case "pending":  return { bg: "#FEF3C7", text: "#92400E" };
    case "appealed": return { bg: "#DBEAFE", text: "#1E40AF" };
    default:         return { bg: "#F1F5F9", text: "#475569" };
=======
    case "Minor":  return { bg: "#22C55E", text: "#fff" };
    case "Major":  return { bg: "#F59E0B", text: "#fff" };
    case "Severe": return { bg: "#EF4444", text: "#fff" };
  }
};

const statusStyle = (s: Status) => {
  switch (s) {
    case "pending": return { bg: "#FEF3C7", text: "#B45309", label: "Open" };
    case "open":    return { bg: "#FEF3C7", text: "#B45309", label: "Open" };
    case "resolved":return { bg: "#DCFCE7", text: "#15803D", label: "Resolved" };
>>>>>>> origin/dev
  }
};

const formatDate = (d: string) =>
<<<<<<< HEAD
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// ─── Violation Row ────────────────────────────────────────────────────────────

function ViolationRow({ item }: { item: Violation }) {
  const sv = severityStyle(item.severity);
  const st = statusStyle(item.status);
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.85}
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

      <View style={{ padding: 14 }}>
        {/* Top row */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          {/* Student info */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#1E293B",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                {initials(item.student?.full_name ?? "?")}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 1 }}
                numberOfLines={1}
              >
                {item.student?.full_name ?? "Unknown"}
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8" }} numberOfLines={1}>
                {item.student?.student_id ? `#${item.student.student_id}` : ""}
                {item.student?.section ? ` · Sec ${item.student.section}` : ""}
              </Text>
            </View>
          </View>

          {/* Chevron */}
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#94A3B8"
            style={{ marginLeft: 8, flexShrink: 0 }}
          />
        </View>

        {/* Violation type + category */}
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 8 }} numberOfLines={1}>
          {item.violation_type?.name ?? "—"}
        </Text>

        {/* Badges row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* Severity */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: sv.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sv.dot }} />
            <Text style={{ fontSize: 10, fontWeight: "700", color: sv.text }}>{item.severity.toUpperCase()}</Text>
          </View>

          {/* Status */}
          <View style={{ backgroundColor: st.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: st.text }}>{item.status.toUpperCase()}</Text>
          </View>

          {/* Date */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" }}>
            <Ionicons name="calendar-outline" size={11} color="#94A3B8" />
            <Text style={{ fontSize: 11, color: "#94A3B8" }}>{formatDate(item.date_of_incident)}</Text>
          </View>
        </View>

        {/* Expanded details */}
        {expanded && (
          <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12, gap: 6 }}>
            {!!item.location && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="location-outline" size={13} color="#94A3B8" />
                <Text style={{ fontSize: 12, color: "#64748B" }}>{item.location}</Text>
              </View>
            )}
            {!!item.description && (
              <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>{item.description}</Text>
            )}
            {!!item.recorder && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Ionicons name="person-outline" size={13} color="#94A3B8" />
                <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
                  Recorded by {item.recorder.full_name}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "appealed", label: "Appealed" },
];

const SEVERITY_FILTERS: { key: Severity | "all"; label: string }[] = [
  { key: "all",    label: "All" },
  { key: "Minor",  label: "Minor" },
  { key: "Major",  label: "Major" },
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

    if (status !== "all")   query = query.eq("status", status);
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

      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: "#1E293B",
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
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
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: statusFilter === f.key ? "#F59E0B" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: statusFilter === f.key ? "#fff" : "#94A3B8",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Search + severity filter ── */}
      <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 24,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 10,
          }}
        >
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
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor:
                  severityFilter === f.key
                    ? f.key === "all"
                      ? "#1E293B"
                      : f.key === "Minor"
                      ? "#F59E0B"
                      : f.key === "Major"
                      ? "#F97316"
                      : "#EF4444"
                    : "#fff",
                borderWidth: 1,
                borderColor:
                  severityFilter === f.key
                    ? "transparent"
                    : "#E2E8F0",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: severityFilter === f.key ? "#fff" : "#64748B",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <ViolationRow item={item} />}
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

      {/* ── FAB ── */}
      <TouchableOpacity
        onPress={() => router.push("/(officer)/record")}
        style={{
          position: "absolute",
          bottom: 24 + insets.bottom,
          right: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#F59E0B",
          borderRadius: 28,
          paddingHorizontal: 20,
          paddingVertical: 14,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Record</Text>
      </TouchableOpacity>
=======
  new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const initials = (name: string) =>
  name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

// ─── Violation Card ───────────────────────────────────────────────────────────

function ViolationCard({ item, onPress, isOfficer }: {
  item: Violation; onPress: () => void; isOfficer: boolean;
}) {
  const sc = severityStyle(item.severity);
  const ss = statusStyle(item.status);

  return (
    <TouchableOpacity onPress={onPress}
      style={{ backgroundColor: "#fff", borderRadius: 12, marginBottom: 10, marginHorizontal: 16, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
      {/* Title row */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B" }} numberOfLines={1}>
            {item.violation_type?.name ?? "Unknown"}
          </Text>
          {isOfficer && (
            <Text style={{ fontSize: 12, color: "#F59E0B", fontWeight: "600", marginTop: 2 }}>
              {item.student?.full_name} (ID: #{item.student?.student_id})
            </Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <View style={{ backgroundColor: sc.bg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: sc.text }}>{item.severity.toUpperCase()}</Text>
          </View>
          <View style={{ backgroundColor: ss.bg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: ss.text }}>{ss.label}</Text>
          </View>
        </View>
      </View>

      {/* Date + location */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
        <Text style={{ fontSize: 12, color: "#64748B" }}>
          {formatDate(item.date_of_incident)}{item.location ? ` · ${item.location}` : ""}
        </Text>
      </View>

      {/* Description preview */}
      {!!item.description && (
        <Text style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic", marginBottom: 6 }} numberOfLines={1}>
          "{item.description}"
        </Text>
      )}

      {/* Officer */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>
          OFFICER: {item.recorder?.full_name?.toUpperCase() ?? "—"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ViolationHistory() {
  const { profile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isOfficer = profile?.role === "admin" || profile?.role === "officer";

  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  // ── Fetch ──
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("student_violations")
        .select(`
          *,
          student:profiles!student_id(id, full_name, student_id, section),
          violation_type:violation_types(name, category),
          recorder:profiles!recorded_by(full_name)
        `)
        .order("date_of_incident", { ascending: false });

      // Students only see their own
      if (!isOfficer) {
        query = query.eq("student_id", profile?.id);
      }

      const { data, error } = await query;
      if (!active) return;
      if (error) Alert.alert("Error", error.message);
      else setViolations((data as any) ?? []);
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [profile]);

  // ── Filter + Search ──
  const filtered = violations.filter(v => {
    const matchSearch = !search ||
      v.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.student?.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      v.violation_type?.name?.toLowerCase().includes(search.toLowerCase());

    if (filter === "By Date") return matchSearch; // already sorted by date
    if (filter === "By Severity") return matchSearch; // will sort below
    if (filter === "By Type") return matchSearch;
    return matchSearch;
  }).sort((a, b) => {
    if (filter === "By Severity") {
      const order = { Severe: 0, Major: 1, Minor: 2 };
      return order[a.severity] - order[b.severity];
    }
    if (filter === "By Type") {
      return (a.violation_type?.name ?? "").localeCompare(b.violation_type?.name ?? "");
    }
    return 0;
  });

  const total = violations.length;
  const open = violations.filter(v => v.status === "pending" || v.status === "open").length;
  const resolved = violations.filter(v => v.status === "resolved").length;

  const FILTERS: FilterType[] = ["All", "By Date", "By Type", "By Severity"];

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ── Header ── */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingBottom: 0, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Violations</Text>
          <TouchableOpacity hitSlop={8}>
            <Text style={{ color: "#F59E0B", fontSize: 13, fontWeight: "700" }}>FILTER</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            {/* ── Record New Violation Banner (officer only) ── */}
            {isOfficer && (
              <TouchableOpacity
                onPress={() => router.push("/(officer)/record")}
                style={{ backgroundColor: "#fff", marginHorizontal: 16, marginTop: 16, marginBottom: 8, borderRadius: 12, flexDirection: "row", alignItems: "center", padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, borderLeftWidth: 4, borderLeftColor: "#F59E0B" }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Ionicons name="document-text-outline" size={20} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B" }}>Record a new student violation</Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Tap to open the violation form</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}

            {/* ── Student card (student view only) ── */}
            {!isOfficer && profile && (
              <View style={{ backgroundColor: "#1E293B", marginHorizontal: 16, marginTop: 16, marginBottom: 8, borderRadius: 12, flexDirection: "row", alignItems: "center", padding: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>{initials(profile.full_name ?? "")}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>{profile.full_name}</Text>
                  <Text style={{ fontSize: 12, color: "#94A3B8" }}>
                    #{profile.student_id} · Section {profile.section}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, fontWeight: "800", color: "#F59E0B" }}>{String(total).padStart(2, "0")}</Text>
                  <Text style={{ fontSize: 10, color: "#94A3B8", fontWeight: "600" }}>TOTAL</Text>
                </View>
              </View>
            )}

            {/* ── Stats row ── */}
            <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 12, gap: 10 }}>
              {[
                { label: "Total", value: total, color: "#1E293B" },
                { label: "Open", value: open, color: "#EF4444" },
                { label: "Resolved", value: resolved, color: "#22C55E" },
              ].map(stat => (
                <View key={stat.label} style={{ flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                  <Text style={{ fontSize: 22, fontWeight: "800", color: stat.color }}>{stat.value}</Text>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5 }}>{stat.label.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            {/* ── Search ── */}
            <View style={{ marginHorizontal: 16, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 }}>
                <Ionicons name="search-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  value={search} onChangeText={setSearch}
                  placeholder={isOfficer ? "Search by student ID or name" : "Search for a student..."}
                  placeholderTextColor="#94A3B8"
                  style={{ flex: 1, fontSize: 14, color: "#1E293B" }}
                />
                {!!search && <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}><Ionicons name="close-circle" size={16} color="#94A3B8" /></TouchableOpacity>}
              </View>
            </View>

            {/* ── Filter chips ── */}
            <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
              {FILTERS.map(f => (
                <TouchableOpacity key={f} onPress={() => setFilter(f)}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === f ? "#1E293B" : "#fff", borderWidth: 1, borderColor: filter === f ? "#1E293B" : "#E2E8F0" }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: filter === f ? "#fff" : "#64748B" }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Section title ── */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B" }}>
                {isOfficer ? "All Violations" : "Violation Records"}
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8" }}>Latest Updated 2m ago</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ViolationCard
            item={item}
            isOfficer={isOfficer}
            onPress={() => router.push({ pathname:"/(officer)/violation/[id]" as any, params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
              <Text style={{ color: "#94A3B8", marginTop: 12, fontSize: 14 }}>No violations found.</Text>
            </View>
          )
        }
      />

      {/* ── FAB (officer only) ── */}
      {isOfficer && (
        <TouchableOpacity
          onPress={() => router.push("/(officer)/record")}
          style={{ position: "absolute", bottom: 24 + insets.bottom, right: 20, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#1E293B", borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>RECORD</Text>
        </TouchableOpacity>
      )}
>>>>>>> origin/dev
    </View>
  );
}