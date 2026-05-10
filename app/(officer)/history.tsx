import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
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

interface ViolationDetail {
  id: string;
  severity: Severity;
  status: string;
  date_of_incident: string;
  time_of_incident: string;
  location: string;
  description: string;
  student: { full_name: string; student_id: string; section: string };
  violation_type: { name: string; category: string };
  recorder: { full_name: string };
  assigned_sanctions: {
    id: string;
    start_date: string;
    end_date: string;
    sanction: { name: string; duration: string };
    assigner: { full_name: string };
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: Severity) => {
  switch (s) {
    case "Minor": return { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" };
    case "Major": return { bg: "#FEE9D9", text: "#9A3412", dot: "#F97316" };
    case "Severe": return { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" };
  }
};

const severityBadgeStyle = (s: Severity) => {
  switch (s) {
    case "Minor": return { bg: "#22C55E", text: "#fff" };
    case "Major": return { bg: "#F59E0B", text: "#fff" };
    case "Severe": return { bg: "#EF4444", text: "#fff" };
  }
};

const statusStyle = (s: string) => {
  switch (s) {
    case "resolved":   return { bg: "#D1FAE5", text: "#065F46" };
    case "pending":    return { bg: "#FEF3C7", text: "#92400E" };
    case "appealed":   return { bg: "#DBEAFE", text: "#1E40AF" };
    case "overturned": return { bg: "#F3E8FF", text: "#6B21A8" };
    default:           return { bg: "#F1F5F9", text: "#475569" };
  }
};

const statusDetailStyle = (s: string) => {
  switch (s) {
    case "pending":
    case "open":       return { bg: "#FEF3C7", text: "#B45309", label: "Open"       };
    case "resolved":   return { bg: "#DCFCE7", text: "#15803D", label: "Resolved"   };
    case "appealed":   return { bg: "#DBEAFE", text: "#1E40AF", label: "Appealed"   };
    case "overturned": return { bg: "#F3E8FF", text: "#6B21A8", label: "Overturned" };
    default:           return { bg: "#F1F5F9", text: "#475569", label: "Unknown"    };
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#94A3B8", width: 90, letterSpacing: 0.3 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: "#1E293B", flex: 1, fontWeight: "500" }}>{value || "—"}</Text>
    </View>
  );
}

// ─── Violation Detail Modal ───────────────────────────────────────────────────

function ViolationDetailModal({
  id,
  onClose,
  onAssignSanction,
}: {
  id: string;
  onClose: () => void;
  onAssignSanction: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const isOfficer = profile?.role === "admin" || profile?.role === "officer";

  const [violation, setViolation] = useState<ViolationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_violations")
        .select(`
          *,
          student:profiles!student_id(full_name, student_id, section),
          violation_type:violation_types(name, category),
          recorder:profiles!recorded_by(full_name),
          assigned_sanctions:violation_sanctions(
            id, start_date, end_date,
            sanction:sanctions(name, duration),
            assigner:profiles!assigned_by(full_name)
          )
        `)
        .eq("id", id)
        .single();
      if (!active) return;
      if (error) Alert.alert("Error", error.message);
      else setViolation(data as any);
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [id]);

  const sc = violation ? severityBadgeStyle(violation.severity) : null;
  const ss = violation ? statusDetailStyle(violation.status) : null;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

        {/* Header */}
        <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Violation Details</Text>
          <View style={{ width: 22 }} />
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : !violation ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#94A3B8" }}>Violation not found.</Text>
          </View>
        ) : (
          <>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

              {/* Title + badges */}
              <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E293B", marginBottom: 10 }}>
                  {violation.violation_type?.name ?? "Unknown"}
                </Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                  <View style={{ backgroundColor: sc!.bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: sc!.text }}>{violation.severity.toUpperCase()}</Text>
                  </View>
                  <View style={{ backgroundColor: ss!.bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: ss!.text }}>{ss!.label.toUpperCase()}</Text>
                  </View>
                </View>

                <DetailRow label="DATE"     value={formatDate(violation.date_of_incident)} />
                <DetailRow label="TIME"     value={violation.time_of_incident ?? "—"} />
                <DetailRow label="LOCATION" value={violation.location ?? "—"} />
                <DetailRow label="OFFICER"  value={violation.recorder?.full_name ?? "—"} />

                <View style={{ paddingTop: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.3, marginBottom: 8 }}>DESCRIPTION</Text>
                  <Text style={{ fontSize: 13, color: "#1E293B", lineHeight: 20 }}>
                    {violation.description || "No description provided."}
                  </Text>
                </View>
              </View>

              {/* Evidence */}
              <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 12 }}>Evidence</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="image-outline" size={28} color="#CBD5E1" />
                  </View>
                  <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="document-outline" size={24} color="#CBD5E1" />
                    <Text style={{ fontSize: 9, color: "#94A3B8", marginTop: 4 }}>EXAM_COPY.PDF</Text>
                  </View>
                </View>
              </View>

              {/* Assigned Sanctions */}
              {violation.assigned_sanctions?.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  {violation.assigned_sanctions.map(vs => (
                    <View key={vs.id} style={{ backgroundColor: "#FFFBEB", borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: "#FDE68A" }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 4 }}>
                        {vs.sanction?.name ?? "Sanction"}
                      </Text>
                      {!!vs.sanction?.duration && (
                        <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Duration: {vs.sanction.duration}</Text>
                      )}
                      {vs.start_date && vs.end_date && (
                        <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                          {formatDate(vs.start_date)} → {formatDate(vs.end_date)}
                        </Text>
                      )}
                      <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
                        Assigned by {vs.assigner?.full_name ?? "Officer"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Action buttons */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, gap: 10 }}>
              {isOfficer && violation.status !== "resolved" && (
                <TouchableOpacity
                  onPress={() => onAssignSanction(violation.id)}
                  style={{ backgroundColor: "#1E293B", borderRadius: 12, paddingVertical: 15, alignItems: "center" }}
                >
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Assign Sanction</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

// ─── Violation Row ────────────────────────────────────────────────────────────

function ViolationRow({
  item,
  onViewDetails,
  onAssignSanction,
}: {
  item: Violation;
  onViewDetails: (id: string) => void;
  onAssignSanction: (id: string) => void;
}) {
  const sv = severityStyle(item.severity);
  const st = statusStyle(item.status);
  const [expanded, setExpanded] = useState(false);

  const canAssignSanction = item.status === "pending";

  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 12, marginBottom: 8, marginHorizontal: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, overflow: "hidden" }}>
      <View style={{ height: 3, backgroundColor: sv.dot }} />

      <TouchableOpacity onPress={() => setExpanded((e) => !e)} activeOpacity={0.85} style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" style={{ marginLeft: 8, flexShrink: 0 }} />
        </View>

        <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 8 }} numberOfLines={1}>
          {item.violation_type?.name ?? "—"}
        </Text>

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

          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <TouchableOpacity
              onPress={() => { setExpanded(false); onViewDetails(item.id); }}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 11, borderWidth: 1, borderColor: "#E2E8F0" }}
            >
              <Ionicons name="eye-outline" size={15} color="#475569" />
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569" }}>View Details</Text>
            </TouchableOpacity>

            {canAssignSanction && (
              <TouchableOpacity
                onPress={() => { setExpanded(false); onAssignSanction(item.id); }}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#1E293B", borderRadius: 10, paddingVertical: 11 }}
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
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "resolved", label: "Resolved" },
  { key: "appealed", label: "Appealed" },
];

const SEVERITY_FILTERS: { key: Severity | "all"; label: string }[] = [
  { key: "all",    label: "All"    },
  { key: "Minor",  label: "Minor"  },
  { key: "Major",  label: "Major"  },
  { key: "Severe", label: "Severe" },
];

export default function ViolationHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [violations,     setViolations]     = useState<Violation[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [selectedId,     setSelectedId]     = useState<string | null>(null);

  const doFetch = async (status: StatusFilter, severity: Severity | "all", silent: boolean) => {
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

  useEffect(() => { doFetch(statusFilter, severityFilter, false); }, [statusFilter, severityFilter]);

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

  const handleAssignSanction = (id: string) => {
    setSelectedId(null);
    router.push({
      pathname: "/(officer)/violation/assign-sanction" as any,
      params: { id },
    });
  };

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

        <View style={{ flexDirection: "row", gap: 8, paddingBottom: 14 }}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setStatusFilter(f.key)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: statusFilter === f.key ? "#F59E0B" : "rgba(255,255,255,0.1)" }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: statusFilter === f.key ? "#fff" : "#94A3B8" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search + severity */}
      <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 }}>
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

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          {SEVERITY_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setSeverityFilter(f.key)}
              style={{
                paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
                backgroundColor: severityFilter === f.key
                  ? f.key === "all" ? "#1E293B" : f.key === "Minor" ? "#F59E0B" : f.key === "Major" ? "#F97316" : "#EF4444"
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
          renderItem={({ item }) => (
            <ViolationRow
              item={item}
              onViewDetails={(id) => setSelectedId(id)}
              onAssignSanction={handleAssignSanction}
            />
          )}
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
        style={{ position: "absolute", bottom: 24 + insets.bottom, right: 20, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F59E0B", borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Record</Text>
      </TouchableOpacity>

      {/* Violation Detail Modal — no routing, no stack issues */}
      {!!selectedId && (
        <ViolationDetailModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onAssignSanction={handleAssignSanction}
        />
      )}
    </View>
  );
}