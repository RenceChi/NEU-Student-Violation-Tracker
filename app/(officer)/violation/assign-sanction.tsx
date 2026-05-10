import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "Minor" | "Major" | "Severe";

interface Sanction {
  id: string;
  name: string;
  description: string;
  duration: string;
  recommended_for: Severity;
}

interface ViolationInfo {
  id: string;
  severity: Severity;
  status: string;
  student: { full_name: string };
  violation_type: { name: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: Severity) => {
  switch (s) {
    case "Minor":  return { bg: "#DCFCE7", text: "#15803D" };
    case "Major":  return { bg: "#FEF3C7", text: "#B45309" };
    case "Severe": return { bg: "#FEE2E2", text: "#B91C1C" };
  }
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AssignSanctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [violation, setViolation] = useState<ViolationInfo | null>(null);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(new Date(Date.now() + 7 * 86400000)));
  const [notifyStudent, setNotifyStudent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch violation info + all sanctions ──
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const [{ data: vData }, { data: sData }] = await Promise.all([
        supabase
          .from("student_violations")
          .select(`id, severity, status, student:profiles!student_id(full_name), violation_type:violation_types(name)`)
          .eq("id", id)
          .single(),
        supabase
          .from("sanctions")
          .select("*")
          .order("recommended_for")
          .order("name"),
      ]);
      if (!active) return;
      setViolation(vData as any);
      setSanctions(sData ?? []);
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [id]);

  const toggleSanction = (sid: string) =>
    setSelectedIds(prev => prev.includes(sid) ? prev.filter(i => i !== sid) : [...prev, sid]);

  // ── Submit ──
  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      Alert.alert("Validation", "Please select at least one sanction.");
      return;
    }
    setSubmitting(true);

    // Insert violation_sanctions rows
    const rows = selectedIds.map(sid => ({
      violation_id: id,
      sanction_id: sid,
      assigned_by: profile?.id,
      start_date: startDate || null,
      end_date: endDate || null,
      notify_student: notifyStudent,
    }));

    const { error } = await supabase.from("violation_sanctions").insert(rows);

    if (error) {
      Alert.alert("Error", error.message);
      setSubmitting(false);
      return;
    }

    // Update violation status to resolved
    await supabase
      .from("student_violations")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("id", id);

    setSubmitting(false);
    Alert.alert("Success", "Sanction assigned successfully.", [
      { text: "OK", onPress: () => router.dismissAll() },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  const sc = violation ? severityStyle(violation.severity) : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ── Header ── */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => router.dismiss()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Assign Sanction</Text>
        <TouchableOpacity onPress={handleAssign} disabled={submitting} hitSlop={8}>
          {submitting
            ? <ActivityIndicator size="small" color="#F59E0B" />
            : <Text style={{ color: "#F59E0B", fontSize: 13, fontWeight: "700" }}>Done</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ── Student + Violation info ── */}
        {violation && sc && (
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>STUDENT</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B" }}>
                  {violation.student?.full_name ?? "Unknown"}
                </Text>
              </View>
              <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignItems: "center" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: sc.text }}>{violation.severity.toUpperCase()}</Text>
                <Text style={{ fontSize: 9, fontWeight: "600", color: sc.text }}>SEVERITY</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="document-text-outline" size={13} color="#94A3B8" />
              <Text style={{ fontSize: 12, color: "#64748B" }}>
                Violation: {violation.violation_type?.name ?? "Unknown"}
              </Text>
              <View style={{ backgroundColor: "#FEF3C7", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#B45309" }}>OPEN</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Select Sanctions ── */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B" }}>Select Sanction(s)</Text>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="add-circle-outline" size={16} color="#F59E0B" />
            <Text style={{ fontSize: 12, color: "#F59E0B", fontWeight: "600" }}>Add custom sanction</Text>
          </TouchableOpacity>
        </View>

        {sanctions.map(s => {
          const selected = selectedIds.includes(s.id);
          const rsc = severityStyle(s.recommended_for);
          return (
            <TouchableOpacity key={s.id} onPress={() => toggleSanction(s.id)}
              style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "flex-start", borderWidth: selected ? 1.5 : 1, borderColor: selected ? "#1E293B" : "#E2E8F0", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
              {/* Checkbox */}
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: selected ? "#1E293B" : "#CBD5E1", backgroundColor: selected ? "#1E293B" : "#fff", alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 2 }}>
                {selected && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", flex: 1, marginRight: 8 }}>{s.name}</Text>
                  <View style={{ backgroundColor: rsc.bg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: rsc.text }}>RECOMMENDED FOR: {s.recommended_for.toUpperCase()}</Text>
                  </View>
                </View>
                {!!s.description && (
                  <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 17 }} numberOfLines={2}>{s.description}</Text>
                )}
                {!!s.duration && (
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{s.duration}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* ── Penalty Period ── */}
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B", marginTop: 8, marginBottom: 12 }}>Penalty Period</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 6 }}>START DATE</Text>
            <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12 }}>
              <TextInput
                value={startDate} onChangeText={setStartDate}
                style={{ flex: 1, fontSize: 13, color: "#1E293B" }}
              />
              <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 6 }}>END DATE</Text>
            <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12 }}>
              <TextInput
                value={endDate} onChangeText={setEndDate}
                style={{ flex: 1, fontSize: 13, color: "#1E293B" }}
              />
              <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
            </View>
          </View>
        </View>

        {/* ── Assigned by + Notify student ── */}
        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B" }}>
                Officer {profile?.full_name ?? ""}
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8" }}>Assigned by</Text>
            </View>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748B" }}>Notify Student</Text>
            <Switch
              value={notifyStudent}
              onValueChange={setNotifyStudent}
              trackColor={{ false: "#E2E8F0", true: "#F59E0B" }}
              thumbColor="#fff"
            />
          </View>
        </View>

      </ScrollView>

      {/* ── Assign button ── */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12 }}>
        <TouchableOpacity
          onPress={handleAssign}
          disabled={submitting}
          style={{ backgroundColor: "#1E293B", borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Assign Sanction</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}