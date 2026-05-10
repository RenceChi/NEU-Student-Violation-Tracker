import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
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
  reviewer: { full_name: string } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusStyle = (s: AppealStatus) => {
  switch (s) {
    case "pending":
      return { bg: "#FEF3C7", text: "#B45309", label: "PENDING" };
    case "under_review":
      return { bg: "#DBEAFE", text: "#1E40AF", label: "UNDER REVIEW" };
    case "approved":
      return { bg: "#D1FAE5", text: "#065F46", label: "APPROVED" };
    case "rejected":
      return { bg: "#FEE2E2", text: "#991B1B", label: "REJECTED" };
  }
};

const severityStyle = (s: string) => {
  switch (s) {
    case "Minor": return { bg: "#FEF3C7", text: "#92400E" };
    case "Major": return { bg: "#FEE9D9", text: "#9A3412" };
    case "Severe": return { bg: "#FEE2E2", text: "#991B1B" };
    default: return { bg: "#F1F5F9", text: "#475569" };
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

// ─── Progress Step ────────────────────────────────────────────────────────────

type StepState = "done" | "active" | "pending";

function ProgressStep({
  label,
  sublabel,
  state,
  isLast,
}: {
  label: string;
  sublabel?: string;
  state: StepState;
  isLast?: boolean;
}) {
  const dotBg =
    state === "done" ? "#D1FAE5" :
      state === "active" ? "#FEF3C7" : "#F1F5F9";

  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {/* Dot + connector */}
      <View style={{ alignItems: "center", width: 24 }}>
        <View style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: dotBg,
          alignItems: "center", justifyContent: "center",
        }}>
          {state === "done" ? (
            <Ionicons name="checkmark" size={13} color="#065F46" />
          ) : state === "active" ? (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" }} />
          ) : (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#CBD5E1" }} />
          )}
        </View>
        {!isLast && (
          <View style={{
            width: 2, flex: 1, minHeight: 20,
            backgroundColor: state === "done" ? "#D1FAE5" : "#E2E8F0",
            marginVertical: 2,
          }} />
        )}
      </View>

      {/* Labels */}
      <View style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
        <Text style={{
          fontSize: 13, fontWeight: "700",
          color: state === "pending" ? "#94A3B8" : "#1E293B",
          marginBottom: sublabel ? 2 : 0,
        }}>
          {label}
        </Text>
        {!!sublabel && (
          <Text style={{ fontSize: 11, color: "#94A3B8", lineHeight: 16 }}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Build Steps from Status ──────────────────────────────────────────────────

function buildSteps(appeal: Appeal) {
  const submittedLabel = `Appeal Submitted · ${formatDateTime(appeal.created_at)}`;
  const reviewedLabel = appeal.reviewed_at ? formatDateTime(appeal.reviewed_at) : undefined;

  switch (appeal.status) {
    case "pending":
      return [
        { label: "Appeal Submitted", sublabel: submittedLabel, state: "done" as StepState },
        { label: "Under Review", sublabel: "Awaiting officer assignment", state: "pending" as StepState },
        { label: "Decision Made", sublabel: undefined, state: "pending" as StepState },
        { label: "Closed", sublabel: undefined, state: "pending" as StepState },
      ];
    case "under_review":
      return [
        { label: "Appeal Submitted", sublabel: submittedLabel, state: "done" as StepState },
        { label: "Under Review", sublabel: "An officer has been assigned to your case", state: "active" as StepState },
        { label: "Decision Made", sublabel: "Awaiting review completion", state: "pending" as StepState },
        { label: "Closed", sublabel: undefined, state: "pending" as StepState },
      ];
    case "approved":
      return [
        { label: "Appeal Submitted", sublabel: submittedLabel, state: "done" as StepState },
        { label: "Under Review", sublabel: reviewedLabel, state: "done" as StepState },
        { label: "Decision Made: Approved", sublabel: reviewedLabel, state: "done" as StepState },
        { label: "Closed", sublabel: "Case finalization and record update", state: "active" as StepState },
      ];
    case "rejected":
      return [
        { label: "Appeal Submitted", sublabel: submittedLabel, state: "done" as StepState },
        { label: "Under Review", sublabel: reviewedLabel, state: "done" as StepState },
        { label: "Decision Made: Rejected", sublabel: reviewedLabel, state: "active" as StepState },
        { label: "Closed", sublabel: undefined, state: "pending" as StepState },
      ];
  }
}

// ─── Appeal Detail Modal ──────────────────────────────────────────────────────

function AppealDetailModal({
  appeal,
  onClose,
}: {
  appeal: Appeal;
  onClose: () => void;
}) {
  const ss = statusStyle(appeal.status);
  const sv = severityStyle(appeal.violation?.severity ?? "");
  const steps = buildSteps(appeal);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

        {/* Header */}
        <View style={{
          backgroundColor: "#1E293B",
          paddingTop: 16, paddingBottom: 16, paddingHorizontal: 16,
          flexDirection: "row", alignItems: "center", gap: 12,
        }}>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", flex: 1 }}>
            Appeals Portal
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Status badge */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={{
              backgroundColor: ss.bg, borderRadius: 20,
              paddingHorizontal: 20, paddingVertical: 8,
            }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: ss.text, letterSpacing: 0.5 }}>
                {ss.label}
              </Text>
            </View>
          </View>

          {/* Violation context */}
          <View style={{
            backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
            shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
              VIOLATION RECORD
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <View style={{ backgroundColor: sv.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: sv.text }}>
                  {(appeal.violation?.severity ?? "").toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                {appeal.violation?.date_of_incident
                  ? formatDate(appeal.violation.date_of_incident)
                  : "—"}
              </Text>
            </View>

            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 6 }}>
              {appeal.violation?.violation_type?.name ?? "Violation"}
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>
              {appeal.violation?.description ?? "—"}
            </Text>
          </View>

          {/* Your submission */}
          <View style={{
            backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
            shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 12 }}>
              YOUR APPEAL SUBMISSION
            </Text>

            <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 4 }}>
              REASON FOR APPEAL
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 12 }}>
              {appeal.reason}
            </Text>

            {!!appeal.preferred_resolution && (
              <>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 4 }}>
                  PREFERRED RESOLUTION
                </Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 12 }}>
                  {appeal.preferred_resolution}
                </Text>
              </>
            )}

            {!!appeal.explanation && (
              <>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 4 }}>
                  ADDITIONAL EXPLANATION
                </Text>
                <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 20 }}>
                  {appeal.explanation}
                </Text>
              </>
            )}
          </View>

          {/* Officer decision — approved or rejected only */}
          {(appeal.status === "approved" || appeal.status === "rejected") && (
            <View style={{
              backgroundColor: appeal.status === "approved" ? "#F0FDF4" : "#FFF1F2",
              borderRadius: 12, padding: 16, marginBottom: 12,
              borderWidth: 1,
              borderColor: appeal.status === "approved" ? "#BBF7D0" : "#FECDD3",
            }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 8 }}>
                OFFICER'S DECISION
              </Text>
              {!!appeal.reviewer && (
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748B", marginBottom: 8 }}>
                  {appeal.reviewer.full_name}
                  {appeal.reviewed_at
                    ? `  ·  Reviewed ${formatDate(appeal.reviewed_at)}`
                    : ""}
                </Text>
              )}
              <Text style={{ fontSize: 13, color: "#1E293B", lineHeight: 20 }}>
                {appeal.officer_notes ?? "No additional notes provided."}
              </Text>
            </View>
          )}

          {/* Progress tracker */}
          <View style={{
            backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
            shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 14 }}>
              APPEAL PROGRESS
            </Text>

            {steps.map((step, i) => (
              <ProgressStep
                key={i}
                label={step.label}
                sublabel={step.sublabel}
                state={step.state}
                isLast={i === steps.length - 1}
              />
            ))}
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Appeal Card ──────────────────────────────────────────────────────────────

function AppealCard({ item, onPress }: { item: Appeal; onPress: () => void }) {
  const ss = statusStyle(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <Text
          style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", flex: 1, marginRight: 10 }}
          numberOfLines={1}
        >
          {item.violation?.violation_type?.name ?? "Violation"}
        </Text>
        <View style={{ backgroundColor: ss.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 9, fontWeight: "800", color: ss.text, letterSpacing: 0.5 }}>
            {ss.label}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>
        Submitted: {formatDate(item.created_at)}
      </Text>

      <Text style={{ fontSize: 12, color: "#64748B" }} numberOfLines={1}>
        {item.explanation ?? item.reason}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={14}
        color="#CBD5E1"
        style={{ position: "absolute", right: 14, bottom: 14 }}
      />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StudentAppeals() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selected, setSelected] = useState<Appeal | null>(null);

  const fetchAppeals = async (silent = false) => {
    if (!profile?.id) return;
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
    reviewer:profiles!reviewed_by ( full_name )
  `)
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false });

    if (!error) setAppeals((data as any) ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAppeals(); }, [profile?.id]);

  const filtered = filter === "all"
    ? appeals
    : appeals.filter((a) => a.status === filter);

  const counts: Record<FilterStatus, number> = {
    all: appeals.length,
    pending: appeals.filter((a) => a.status === "pending").length,
    under_review: appeals.filter((a) => a.status === "under_review").length,
    approved: appeals.filter((a) => a.status === "approved").length,
    rejected: appeals.filter((a) => a.status === "rejected").length,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* Header */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{
          flexDirection: "row", alignItems: "center",
          justifyContent: "space-between", marginBottom: 16,
        }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>My Appeals</Text>
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
              <Text style={{
                fontSize: 12, fontWeight: "700",
                color: filter === f.key ? "#fff" : "#94A3B8",
              }}>
                {f.label}
              </Text>
              {counts[f.key] > 0 && (
                <View style={{
                  backgroundColor: filter === f.key
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.15)",
                  borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>
                    {counts[f.key]}
                  </Text>
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
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => fetchAppeals(true)}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 64 }}>
              <Ionicons name="chatbubble-ellipses-outline" size={52} color="#CBD5E1" />
              <Text style={{ color: "#94A3B8", marginTop: 12, fontSize: 14, fontWeight: "600" }}>
                {filter !== "all"
                  ? `No ${filter.replace("_", " ")} appeals.`
                  : "No appeals yet."}
              </Text>
              <Text style={{ color: "#CBD5E1", marginTop: 6, fontSize: 12, textAlign: "center", paddingHorizontal: 32 }}>
                Submit an appeal from any open violation on your Violations tab.
              </Text>
            </View>
          }
        />
      )}

      {/* Detail modal */}
      {!!selected && (
        <AppealDetailModal
          appeal={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </View>
  );
}