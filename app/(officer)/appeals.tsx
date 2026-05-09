import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppealStatus = "pending" | "under_review" | "approved" | "rejected";
type FilterStatus = "all" | AppealStatus;

interface Appeal {
  id: string;
  reason: string;
  explanation: string | null;
  preferred_resolution: string | null;
  status: AppealStatus;
  officer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  violation: {
    id: string;
    severity: string;
    date_of_incident: string;
    description: string;
    violation_type: { name: string } | null;
  } | null;
  student: { full_name: string; student_id?: string; section?: string } | null;
  reviewer: { full_name: string } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { key: FilterStatus; label: string }[] = [
  { key: "all",          label: "All"          },
  { key: "pending",      label: "Pending"      },
  { key: "under_review", label: "Under Review" },
  { key: "approved",     label: "Approved"     },
  { key: "rejected",     label: "Rejected"     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusStyle = (s: AppealStatus) => {
  switch (s) {
    case "pending":      return { bg: "#FEF3C7", text: "#B45309", label: "PENDING"      };
    case "under_review": return { bg: "#DBEAFE", text: "#1E40AF", label: "UNDER REVIEW" };
    case "approved":     return { bg: "#D1FAE5", text: "#065F46", label: "APPROVED"     };
    case "rejected":     return { bg: "#FEE2E2", text: "#991B1B", label: "REJECTED"     };
  }
};

const severityStyle = (s: string) => {
  switch (s) {
    case "Minor":  return { bg: "#FEF3C7", text: "#92400E" };
    case "Major":  return { bg: "#FEE9D9", text: "#9A3412" };
    case "Severe": return { bg: "#FEE2E2", text: "#991B1B" };
    default:       return { bg: "#F1F5F9", text: "#475569" };
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// ─── Review Modal (Officers + Admins) ────────────────────────────────────────

function ReviewModal({
  appeal,
  onClose,
  onUpdated,
}: {
  appeal: Appeal;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { profile } = useAuth();
  const [notes,      setNotes]      = useState(appeal.officer_notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isFinalized = appeal.status === "approved" || appeal.status === "rejected";

  const handleDecision = async (decision: "under_review" | "approved" | "rejected") => {
    if ((decision === "approved" || decision === "rejected") && !notes.trim()) {
      Alert.alert("Notes Required", "Please provide decision notes before approving or rejecting.");
      return;
    }

    Alert.alert(
      decision === "under_review" ? "Mark as Under Review?"
        : decision === "approved"  ? "Approve Appeal?"
        : "Reject Appeal?",
      decision === "under_review"
        ? "This will notify the student that their appeal is being reviewed."
        : `This will ${decision} the student's appeal and cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: decision === "under_review" ? "Confirm"
            : decision === "approved" ? "Approve"
            : "Reject",
          style: decision === "rejected" ? "destructive" : "default",
          onPress: async () => {
            setSubmitting(true);

            const { error } = await supabase
              .from("appeals")
              .update({
                status:        decision,
                officer_notes: notes.trim() || null,
                reviewed_by:   profile?.id,
                reviewed_at:   new Date().toISOString(),
              })
              .eq("id", appeal.id);

            if (error) {
              Alert.alert("Error", error.message);
              setSubmitting(false);
              return;
            }

            // On approve → set violation to overturned
            // On reject  → leave violation status as-is (appealed)
            if (decision === "approved" && appeal.violation?.id) {
              await supabase
                .from("student_violations")
                .update({ status: "overturned" })
                .eq("id", appeal.violation.id);
            }

            setSubmitting(false);
            onUpdated();
            onClose();
          },
        },
      ]
    );
  };

  const ss = statusStyle(appeal.status);
  const sv = severityStyle(appeal.violation?.severity ?? "");

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "#F1F5F9" }}
      >
        {/* Header */}
        <View style={{
          backgroundColor: "#1E293B",
          paddingTop: 16, paddingBottom: 16, paddingHorizontal: 16,
          flexDirection: "row", alignItems: "center", gap: 12,
        }}>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", flex: 1 }}>Appeal Review</Text>
          <View style={{ backgroundColor: ss.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: "800", color: ss.text }}>{ss.label}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Student */}
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 12 }}>STUDENT</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{initials(appeal.student?.full_name ?? "?")}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B" }}>{appeal.student?.full_name ?? "Unknown"}</Text>
                <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                  {appeal.student?.student_id ? `ID: #${appeal.student.student_id}` : ""}
                  {appeal.student?.section ? ` · ${appeal.student.section}` : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Violation */}
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>VIOLATION RECORD</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <View style={{ backgroundColor: sv.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: sv.text }}>{(appeal.violation?.severity ?? "").toUpperCase()}</Text>
              </View>
              <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                {appeal.violation?.date_of_incident ? formatDate(appeal.violation.date_of_incident) : "—"}
              </Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 6 }}>
              {appeal.violation?.violation_type?.name ?? "Violation"}
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>
              {appeal.violation?.description ?? "—"}
            </Text>
          </View>

          {/* Student submission */}
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 12 }}>STUDENT'S SUBMISSION</Text>

            <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 4 }}>REASON</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 12 }}>{appeal.reason}</Text>

            {!!appeal.preferred_resolution && (
              <>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 4 }}>PREFERRED RESOLUTION</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 12 }}>{appeal.preferred_resolution}</Text>
              </>
            )}

            {!!appeal.explanation && (
              <>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 4 }}>EXPLANATION</Text>
                <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 20 }}>{appeal.explanation}</Text>
              </>
            )}

            <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic", marginTop: 12 }}>
              Submitted {formatDateTime(appeal.created_at)}
            </Text>
          </View>

          {/* Decision notes input */}
          {!isFinalized && (
            <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 8 }}>DECISION NOTES</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Write your decision rationale here. This will be visible to the student."
                placeholderTextColor="#CBD5E1"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{
                  borderWidth: 1,
                  borderColor: notes ? "#1E293B" : "#E2E8F0",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  fontSize: 14,
                  color: "#1E293B",
                  minHeight: 120,
                }}
              />
              <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>
                Required for Approve or Reject decisions.
              </Text>
            </View>
          )}

          {/* Existing notes — finalized */}
          {isFinalized && !!appeal.officer_notes && (
            <View style={{
              backgroundColor: appeal.status === "approved" ? "#F0FDF4" : "#FFF1F2",
              borderRadius: 12, padding: 16, marginBottom: 16,
              borderWidth: 1,
              borderColor: appeal.status === "approved" ? "#BBF7D0" : "#FECDD3",
            }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 8 }}>DECISION NOTES</Text>
              <Text style={{ fontSize: 13, color: "#1E293B", lineHeight: 20 }}>{appeal.officer_notes}</Text>
              {!!appeal.reviewer && (
                <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic", marginTop: 8 }}>
                  — {appeal.reviewer.full_name}{appeal.reviewed_at ? `, ${formatDate(appeal.reviewed_at)}` : ""}
                </Text>
              )}
            </View>
          )}

          {/* Action buttons */}
          {!isFinalized && (
            <View style={{ gap: 10 }}>
              {appeal.status === "pending" && (
                <TouchableOpacity
                  onPress={() => handleDecision("under_review")}
                  disabled={submitting}
                  style={{ backgroundColor: "#1E40AF", borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Ionicons name="search-outline" size={18} color="#fff" />
                      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Mark Under Review</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleDecision("approved")}
                disabled={submitting}
                style={{ backgroundColor: "#059669", borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Approve Appeal</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDecision("rejected")}
                disabled={submitting}
                style={{ borderWidth: 1.5, borderColor: "#EF4444", borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
              >
                {submitting ? <ActivityIndicator color="#EF4444" /> : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                    <Text style={{ color: "#EF4444", fontSize: 15, fontWeight: "700" }}>Reject Appeal</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Appeal Card ──────────────────────────────────────────────────────────────

function AppealCard({ item, onPress }: { item: Appeal; onPress: () => void }) {
  const ss = statusStyle(item.status);
  const sv = severityStyle(item.violation?.severity ?? "");

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 10,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        overflow: "hidden",
      }}
    >
      <View style={{ height: 3, backgroundColor: ss.text }} />

      <View style={{ padding: 14 }}>
        {/* Student row */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                {initials(item.student?.full_name ?? "?")}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B" }} numberOfLines={1}>
                {item.student?.full_name ?? "Unknown"}
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8" }} numberOfLines={1}>
                {item.student?.student_id ? `#${item.student.student_id}` : ""}
                {item.student?.section ? ` · ${item.student.section}` : ""}
              </Text>
            </View>
          </View>
          <View style={{ backgroundColor: ss.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0, marginLeft: 8 }}>
            <Text style={{ fontSize: 9, fontWeight: "800", color: ss.text }}>{ss.label}</Text>
          </View>
        </View>

        {/* Violation name */}
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 8 }} numberOfLines={1}>
          {item.violation?.violation_type?.name ?? "—"}
        </Text>

        {/* Bottom row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ backgroundColor: sv.bg, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: sv.text }}>
              {(item.violation?.severity ?? "").toUpperCase()}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: "#94A3B8", flex: 1 }} numberOfLines={1}>{item.reason}</Text>
          <Text style={{ fontSize: 11, color: "#94A3B8" }}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OfficerAppeals() {
  const insets = useSafeAreaInsets();

  const [appeals,    setAppeals]    = useState<Appeal[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState<FilterStatus>("all");
  const [selected,   setSelected]   = useState<Appeal | null>(null);

  const fetchAppeals = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);

    const { data, error } = await supabase
      .from("appeals")
      .select(`
        id, reason, explanation, preferred_resolution,
        status, officer_notes, reviewed_at, created_at,
        violation:student_violations!violation_id (
          id, severity, date_of_incident, description,
          violation_type:violation_types!violation_type_id ( name )
        ),
        student:student_id ( full_name, student_id, section ),
        reviewer:reviewed_by ( full_name )
      `)
      .order("created_at", { ascending: false });

    if (!error) setAppeals((data as any) ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAppeals(); }, []);

  const filtered = filter === "all"
    ? appeals
    : appeals.filter((a) => a.status === filter);

  const counts: Record<FilterStatus, number> = {
    all:          appeals.length,
    pending:      appeals.filter((a) => a.status === "pending").length,
    under_review: appeals.filter((a) => a.status === "under_review").length,
    approved:     appeals.filter((a) => a.status === "approved").length,
    rejected:     appeals.filter((a) => a.status === "rejected").length,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* Header */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>Appeals</Text>
          <View style={{ backgroundColor: "#F59E0B", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              {loading ? "—" : counts.all}
            </Text>
          </View>
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
        >
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 5,
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                backgroundColor: filter === f.key ? "#F59E0B" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: filter === f.key ? "#fff" : "#94A3B8" }}>
                {f.label}
              </Text>
              {counts[f.key] > 0 && (
                <View style={{
                  backgroundColor: filter === f.key ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
                  borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{counts[f.key]}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
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
            <AppealCard item={item} onPress={() => setSelected(item)} />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => fetchAppeals(true)}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 64 }}>
              <Ionicons name="chatbubble-ellipses-outline" size={52} color="#CBD5E1" />
              <Text style={{ color: "#94A3B8", marginTop: 12, fontSize: 14, fontWeight: "600" }}>
                {filter !== "all" ? `No ${filter.replace("_", " ")} appeals.` : "No appeals yet."}
              </Text>
            </View>
          }
        />
      )}

      {/* Review modal — all officers and admins have full control */}
      {!!selected && (
        <ReviewModal
          appeal={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchAppeals}
        />
      )}
    </View>
  );
}