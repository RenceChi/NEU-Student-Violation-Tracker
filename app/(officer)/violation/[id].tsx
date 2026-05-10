import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "Minor" | "Major" | "Severe";
type Status = "pending" | "open" | "resolved";

interface ViolationDetail {
  id: string;
  severity: Severity;
  status: Status;
  date_of_incident: string;
  time_of_incident: string;
  location: string;
  description: string;
  created_at: string;
  student: { id?: string; full_name: string; student_id: string; section: string };
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

interface EvidenceFile {
  name: string;
  url: string;
  type: "image" | "document";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: Severity) => {
  switch (s) {
    case "Minor": return { bg: "#22C55E", text: "#fff" };
    case "Major": return { bg: "#F59E0B", text: "#fff" };
    case "Severe": return { bg: "#EF4444", text: "#fff" };
  }
};

const statusStyle = (s: string) => {
  switch (s) {
    case "pending":
    case "open": return { bg: "#FEF3C7", text: "#B45309", label: "Open" };
    case "resolved": return { bg: "#DCFCE7", text: "#15803D", label: "Resolved" };
    case "appealed": return { bg: "#DBEAFE", text: "#1E40AF", label: "Appealed" };
    case "overturned": return { bg: "#F3E8FF", text: "#6B21A8", label: "Overturned" };
    default: return { bg: "#F1F5F9", text: "#475569", label: "Unknown" };
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext && ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image-outline";
  if (ext === "pdf") return "document-text-outline";
  return "document-outline";
};
const normalizePublicUrl = (url: string) => {
  try {
    return encodeURI(url);
  } catch {
    return url;
  }
};
// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#94A3B8", width: 90, letterSpacing: 0.3 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: "#1E293B", flex: 1, fontWeight: "500" }}>{value || "—"}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ViolationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const isOfficer = profile?.role === "admin" || profile?.role === "officer";

  const [violation, setViolation] = useState<ViolationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(true);


  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_violations")
        .select(`
          *,
          student:profiles!student_id(id, full_name, student_id, section),
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

  useEffect(() => {
    if (!violation) return;
    
    // Skip reloading if evidence is already loaded
    if (evidenceFiles.length > 0) {
      return;
    }
    
    let active = true;

    const loadEvidence = async () => {
      setLoadingEvidence(true);
      const folder = id;
      const foundFiles: EvidenceFile[] = [];

      const { data: list, error } = await supabase
        .storage
        .from("violation-evidence")
        .list(folder, { limit: 100 });

      if (!error && list) {
        for (const item of list) {
          const path = `${folder}/${item.name}`;
          const { data: urlData } = supabase
            .storage
            .from("violation-evidence")
            .getPublicUrl(path);

          const rawUrl = urlData?.publicUrl ?? "";
          const publicUrl = rawUrl ? normalizePublicUrl(rawUrl) : "";
          if (!publicUrl) continue;

          const ext = item.name.split(".").pop()?.toLowerCase();
          const type: EvidenceFile["type"] = ext && ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
            ? "image"
            : "document";

          console.log(`[Evidence] Loaded ${type} file: ${item.name}\nURL: ${publicUrl}`);
          foundFiles.push({ name: item.name, url: publicUrl, type });
        }
      }

      if (!active) return;
      setEvidenceFiles(foundFiles);
      setLoadingEvidence(false);
    };

    loadEvidence();
    return () => { active = false; };
  }, [id, violation]);

  const openEvidence = async (url: string) => {
    try {
      const encodedUrl = normalizePublicUrl(url);
      await Linking.openURL(encodedUrl);
    } catch {
      Alert.alert("Cannot open file", "This file cannot be opened on this device.");
    }
  };

  const EvidenceTile = ({ file }: { file: EvidenceFile }) => {
    const [loadFailed, setLoadFailed] = useState(false);
    const safeUrl = normalizePublicUrl(file.url);
    const isImage = file.type === "image" && !loadFailed;

    return (
      <TouchableOpacity
        onPress={() => openEvidence(safeUrl)}
        activeOpacity={0.8}
        style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", padding: 6 }}
      >
        {isImage ? (
          <Image
            source={{ uri: safeUrl }}
            style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: "#E2E8F0" }}
            resizeMode="cover"
            onError={(e) => {
              console.warn(`[Evidence] Image load failed for ${file.name}:`, e);
              setLoadFailed(true);
            }}
          />
        ) : (
          <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", padding: 8 }}>
            <Ionicons name={fileIcon(file.name)} size={28} color="#6366F1" />
            <Text style={{ fontSize: 9, color: "#475569", marginTop: 4, textAlign: "center" }} numberOfLines={2}>
              {file.name}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!violation) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <Text style={{ color: "#94A3B8" }}>Violation not found.</Text>
      </View>
    );
  }

  const sc = severityStyle(violation.severity);
  const ss = statusStyle(violation.status);

  console.log(`[Violation Detail] Loaded ${evidenceFiles.length} evidence files:`, evidenceFiles);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ── Header ── */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity
          // ✅ router.dismiss() pops the entire violation stack back to the tab
          onPress={() => {
            router.dismiss();
          }}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Violation Details</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ── Title + badges ── */}
        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E293B", marginBottom: 10 }}>
            {violation.violation_type?.name ?? "Unknown"}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <View style={{ backgroundColor: sc.bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: sc.text }}>{violation.severity.toUpperCase()}</Text>
            </View>
            <View style={{ backgroundColor: ss.bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: ss.text }}>{ss.label.toUpperCase()}</Text>
            </View>
          </View>

          <DetailRow label="DATE" value={formatDate(violation.date_of_incident)} />
          <DetailRow label="TIME" value={violation.time_of_incident ?? "—"} />
          <DetailRow label="LOCATION" value={violation.location ?? "—"} />
          <DetailRow label="OFFICER" value={violation.recorder?.full_name ?? "—"} />

          {/* Description */}
          <View style={{ paddingTop: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.3, marginBottom: 8 }}>DESCRIPTION</Text>
            <Text style={{ fontSize: 13, color: "#1E293B", lineHeight: 20 }}>
              {violation.description || "No description provided."}
            </Text>
          </View>
        </View>

        {/* ── Evidence ── */}
        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 12 }}>Evidence</Text>
          {loadingEvidence ? (
            <ActivityIndicator size="small" color="#94A3B8" />
          ) : evidenceFiles.length === 0 ? (
            <Text style={{ fontSize: 13, color: "#64748B" }}>No evidence files uploaded for this violation.</Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {evidenceFiles.map((file) => (
                <EvidenceTile key={file.name} file={file} />
              ))}
            </View>
          )}
        </View>

        {/* ── Assigned Sanctions ── */}
        {violation.assigned_sanctions?.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            {violation.assigned_sanctions.map(vs => (
              <View key={vs.id} style={{ backgroundColor: "#FFFBEB", borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: "#FDE68A", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
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

      {/* ── Action buttons ── */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, gap: 10 }}>
        {isOfficer && violation.status !== "resolved" && (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/(officer)/violation/assign-sanction" as any, params: { id: violation.id } })}
            style={{ backgroundColor: "#1E293B", borderRadius: 12, paddingVertical: 15, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Assign Sanction</Text>
          </TouchableOpacity>
        )}
        {!isOfficer && (
          <TouchableOpacity
            style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingVertical: 15, alignItems: "center" }}>
            <Text style={{ color: "#1E293B", fontSize: 15, fontWeight: "700" }}>Submit Appeal</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}