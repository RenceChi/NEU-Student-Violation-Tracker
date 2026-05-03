import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActionSheetIOS,
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

type Severity = "Minor" | "Major" | "Severe";
type Category = "Conduct" | "Attendance" | "Facilities" | "Safety";

interface Sanction {
  id: string;
  name: string;
  description: string;
  duration: string;
  recommended_for: Severity;
  updated_by?: string;
  created_at: string;
  updater?: { full_name: string };
}

interface ViolationType {
  id: string;
  name: string;
  description: string;
  default_severity: Severity;
  category: Category;
  updated_by?: string;
  created_at: string;
  updater?: { full_name: string };
  linked_sanctions?: { sanction: { id: string; name: string } }[];
}

const SEVERITIES: Severity[] = ["Minor", "Major", "Severe"];
const CATEGORIES: Category[] = ["Conduct", "Attendance", "Facilities", "Safety"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: Severity) => {
  switch (s) {
    case "Minor":  return { bg: "#F59E0B", text: "#fff" };
    case "Major":  return { bg: "#F97316", text: "#fff" };
    case "Severe": return { bg: "#EF4444", text: "#fff" };
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const emptyViolation = (): Partial<ViolationType> => ({
  name: "", description: "", default_severity: "Minor", category: "Conduct",
});

const emptySanction = (): Partial<Sanction> => ({
  name: "", description: "", duration: "", recommended_for: "Minor",
});

// ─── Violation Modal ──────────────────────────────────────────────────────────

function ViolationModal({ visible, initial, allSanctions, onClose, onSave }: {
  visible: boolean;
  initial: Partial<ViolationType> | null;
  allSanctions: Sanction[];
  onClose: () => void;
  onSave: (d: Partial<ViolationType>, linkedIds: string[]) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<ViolationType>>(emptyViolation());
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);

  useEffect(() => {
    setForm(initial ?? emptyViolation());
    setLinkedIds(initial?.linked_sanctions?.map(ls => ls.sanction.id) ?? []);
  }, [initial, visible]);

  const set = (k: keyof ViolationType, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleSanction = (id: string) =>
    setLinkedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSave = async () => {
    if (!form.name?.trim()) { Alert.alert("Validation", "Name is required."); return; }
    setSaving(true);
    await onSave(form, linkedIds);
    setSaving(false);
  };

  const isEdit = !!initial?.id;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Drag handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" }} />
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1E293B", marginTop: 12, marginBottom: 4 }}>
            {isEdit ? "Edit Violation Type" : "Add Violation Type"}
          </Text>
          {!isEdit && (
            <Text style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>
              Define a new violation for the library records.
            </Text>
          )}

          {/* Name */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6, marginTop: 8 }}>NAME</Text>
          <TextInput
            value={form.name} onChangeText={v => set("name", v)}
            placeholder="e.g. Repeated Tardiness"
            placeholderTextColor="#CBD5E1"
            style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#1E293B", marginBottom: 16 }}
          />

          {/* Description */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>DESCRIPTION</Text>
          <TextInput
            value={form.description} onChangeText={v => set("description", v)}
            placeholder="Provide a detailed description of the violation criteria..."
            placeholderTextColor="#CBD5E1"
            multiline numberOfLines={4} textAlignVertical="top"
            style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#1E293B", minHeight: 100, marginBottom: 16 }}
          />

          {/* Category */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>CATEGORY</Text>
          <TouchableOpacity
            onPress={() => setShowCatPicker(!showCatPicker)}
            style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}
          >
            <Text style={{ fontSize: 14, color: form.category ? "#1E293B" : "#CBD5E1" }}>
              {form.category ?? "Select category..."}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#94A3B8" />
          </TouchableOpacity>
          {showCatPicker && (
            <View style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
              {CATEGORIES.map((c, i) => (
                <TouchableOpacity key={c} onPress={() => { set("category", c); setShowCatPicker(false); }}
                  style={{ padding: 13, borderBottomWidth: i < CATEGORIES.length - 1 ? 1 : 0, borderBottomColor: "#F8FAFC", backgroundColor: form.category === c ? "#F8FAFC" : "#fff" }}>
                  <Text style={{ fontSize: 14, color: "#1E293B", fontWeight: form.category === c ? "600" : "400" }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Default Severity */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 8, marginTop: 8 }}>DEFAULT SEVERITY</Text>
          <View style={{ flexDirection: "row", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
            {SEVERITIES.map((s) => {
              const active = form.default_severity === s;
              const sc = severityStyle(s);
              return (
                <TouchableOpacity key={s} onPress={() => set("default_severity", s)}
                  style={{ flex: 1, paddingVertical: 11, alignItems: "center", backgroundColor: active ? sc.bg : "#fff" }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: active ? "#fff" : "#94A3B8" }}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Link Sanctions */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>LINK SANCTIONS</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {allSanctions.map(s => {
              const linked = linkedIds.includes(s.id);
              return (
                <TouchableOpacity key={s.id} onPress={() => toggleSanction(s.id)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: linked ? "#F59E0B" : "#E2E8F0", backgroundColor: linked ? "#FFFBEB" : "#fff" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: linked ? "#B45309" : "#64748B" }}>{s.name}</Text>
                  {linked
                    ? <Ionicons name="checkmark" size={14} color="#B45309" />
                    : <Ionicons name="add" size={14} color="#94A3B8" />
                  }
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
          <TouchableOpacity onPress={handleSave} disabled={saving}
            style={{ backgroundColor: "#1E293B", borderRadius: 10, paddingVertical: 16, alignItems: "center" }}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Save</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}
            style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingVertical: 16, alignItems: "center" }}>
            <Text style={{ color: "#64748B", fontSize: 15, fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Sanction Modal ───────────────────────────────────────────────────────────

function SanctionModal({ visible, initial, onClose, onSave }: {
  visible: boolean;
  initial: Partial<Sanction> | null;
  onClose: () => void;
  onSave: (d: Partial<Sanction>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Sanction>>(emptySanction());
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial ?? emptySanction()); }, [initial, visible]);
  const set = (k: keyof Sanction, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim()) { Alert.alert("Validation", "Name is required."); return; }
    setSaving(true); await onSave(form); setSaving(false);
  };

  const isEdit = !!initial?.id;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" }} />
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1E293B", marginTop: 12, marginBottom: 4 }}>
            {isEdit ? "Edit Sanction" : "Add Sanction"}
          </Text>
          <Text style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>
            Define a new disciplinary action for the library records.
          </Text>

          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>NAME</Text>
          <TextInput value={form.name} onChangeText={v => set("name", v)}
            placeholder="e.g. After-school Detention"
            placeholderTextColor="#CBD5E1"
            style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#1E293B", marginBottom: 16 }} />

          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>DESCRIPTION</Text>
          <TextInput value={form.description} onChangeText={v => set("description", v)}
            placeholder="Provide details about the sanction requirements..."
            placeholderTextColor="#CBD5E1"
            multiline numberOfLines={3} textAlignVertical="top"
            style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#1E293B", minHeight: 90, marginBottom: 16 }} />

          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>DURATION</Text>
          <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 14, marginBottom: 20 }}>
            <TextInput value={form.duration} onChangeText={v => set("duration", v)}
              placeholder="e.g. 1-3 days"
              placeholderTextColor="#CBD5E1"
              style={{ flex: 1, fontSize: 14, color: "#1E293B", paddingVertical: 13 }} />
            <Ionicons name="time-outline" size={16} color="#CBD5E1" />
          </View>

          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 8 }}>RECOMMENDED FOR</Text>
          <View style={{ flexDirection: "row", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, overflow: "hidden", marginBottom: 28 }}>
            {SEVERITIES.map((s) => {
              const active = form.recommended_for === s;
              const sc = severityStyle(s);
              return (
                <TouchableOpacity key={s} onPress={() => set("recommended_for", s)}
                  style={{ flex: 1, paddingVertical: 11, alignItems: "center", backgroundColor: active ? sc.bg : "#fff" }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: active ? "#fff" : "#94A3B8" }}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
          <TouchableOpacity onPress={handleSave} disabled={saving}
            style={{ backgroundColor: "#1E293B", borderRadius: 10, paddingVertical: 16, alignItems: "center" }}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Save Sanction</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}
            style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingVertical: 16, alignItems: "center" }}>
            <Text style={{ color: "#64748B", fontSize: 15, fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Violation Card ───────────────────────────────────────────────────────────

function ViolationCard({ item, canEdit, onEdit, onDelete }: {
  item: ViolationType; canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const sc = severityStyle(item.default_severity);

  const showMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", "Edit", "Delete"], destructiveButtonIndex: 2, cancelButtonIndex: 0 },
        i => { if (i === 1) onEdit(); if (i === 2) onDelete(); }
      );
    } else {
      Alert.alert(item.name, "", [
        { text: "Edit", onPress: onEdit },
        { text: "Delete", onPress: onDelete, style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const linkedNames = item.linked_sanctions?.map(ls => ls.sanction.name) ?? [];

  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 12, marginBottom: 10, marginHorizontal: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, padding: 14 }}>
      {/* Title + menu */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", flex: 1, marginRight: 8 }} numberOfLines={1}>{item.name}</Text>
        {canEdit && (
          <TouchableOpacity onPress={showMenu} hitSlop={8}>
            <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category + Severity */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <View style={{ backgroundColor: "#F1F5F9", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", letterSpacing: 0.5 }}>{item.category.toUpperCase()}</Text>
        </View>
        <View style={{ backgroundColor: sc.bg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: sc.text, letterSpacing: 0.5 }}>{item.default_severity.toUpperCase()}</Text>
        </View>
      </View>

      {/* Linked sanctions */}
      {linkedNames.length > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Ionicons name="link-outline" size={13} color="#94A3B8" />
          <Text style={{ fontSize: 12, color: "#64748B" }}>
            Linked:{" "}
            <Text style={{ color: "#F59E0B", fontWeight: "600" }}>{linkedNames.join(", ")}</Text>
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="person" size={11} color="#94A3B8" />
        </View>
        <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
          Last updated by {item.updater?.full_name ?? "System"} • {timeAgo(item.created_at)}
        </Text>
      </View>
    </View>
  );
}

// ─── Sanction Card ────────────────────────────────────────────────────────────

function SanctionCard({ item, canEdit, onEdit, onDelete }: {
  item: Sanction; canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const sc = severityStyle(item.recommended_for);

  const showMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", "Edit", "Delete"], destructiveButtonIndex: 2, cancelButtonIndex: 0 },
        i => { if (i === 1) onEdit(); if (i === 2) onDelete(); }
      );
    } else {
      Alert.alert(item.name, "", [
        { text: "Edit", onPress: onEdit },
        { text: "Delete", onPress: onDelete, style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 12, marginBottom: 10, marginHorizontal: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, padding: 14 }}>
      {/* Title + menu */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", flex: 1, marginRight: 8 }} numberOfLines={1}>{item.name}</Text>
        {canEdit && (
          <TouchableOpacity onPress={showMenu} hitSlop={8}>
            <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {!!item.description && (
        <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>{item.description}</Text>
      )}

      {/* Duration */}
      {!!item.duration && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Ionicons name="time-outline" size={13} color="#94A3B8" />
          <Text style={{ fontSize: 12, color: "#64748B" }}>Duration: {item.duration}</Text>
        </View>
      )}

      {/* Severity badge */}
      <View style={{ alignSelf: "flex-start", backgroundColor: sc.bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: sc.text, letterSpacing: 0.5 }}>{item.recommended_for.toUpperCase()}</Text>
      </View>

      {/* Footer */}
      <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
        Last updated by {item.updater?.full_name ?? "System"} • {timeAgo(item.created_at)}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Tab = "violations" | "sanctions";

export default function LibraryScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const canEdit = profile?.role === "admin";

  const [activeTab, setActiveTab] = useState<Tab>("violations");
  const [search, setSearch] = useState("");

  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [vLoading, setVLoading] = useState(true);
  const [vModal, setVModal] = useState(false);
  const [vEditing, setVEditing] = useState<Partial<ViolationType> | null>(null);

  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [sLoading, setSLoading] = useState(true);
  const [sModal, setSModal] = useState(false);
  const [sEditing, setSEditing] = useState<Partial<Sanction> | null>(null);

  // ── Fetch violations with linked sanctions + updater ──
  const fetchViolations = async () => {
    const { data, error } = await supabase
      .from("violation_types")
      .select(`*, updater:updated_by(full_name), linked_sanctions:violation_type_sanctions(sanction:sanctions(id, name))`)
      .order("name");
    if (error) Alert.alert("Error", error.message);
    else setViolations((data as any) ?? []);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setVLoading(true);
      const { data, error } = await supabase
        .from("violation_types")
        .select(`*, updater:updated_by(full_name), linked_sanctions:violation_type_sanctions(sanction:sanctions(id, name))`)
        .order("name");
      if (!active) return;
      if (error) Alert.alert("Error", error.message);
      else setViolations((data as any) ?? []);
      setVLoading(false);
    };
    load();
    return () => { active = false; };
  }, []);

  // ── Fetch sanctions with updater ──
  const fetchSanctions = async () => {
    const { data, error } = await supabase
      .from("sanctions")
      .select(`*, updater:updated_by(full_name)`)
      .order("name");
    if (error) Alert.alert("Error", error.message);
    else setSanctions((data as any) ?? []);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setSLoading(true);
      const { data, error } = await supabase
        .from("sanctions")
        .select(`*, updater:updated_by(full_name)`)
        .order("name");
      if (!active) return;
      if (error) Alert.alert("Error", error.message);
      else setSanctions((data as any) ?? []);
      setSLoading(false);
    };
    load();
    return () => { active = false; };
  }, []);

  // ── Violation CRUD ──
  const handleVSave = async (form: Partial<ViolationType>, linkedIds: string[]) => {
    let violationId = form.id;

    if (violationId) {
      const { error } = await supabase.from("violation_types")
        .update({ name: form.name, description: form.description, default_severity: form.default_severity, category: form.category, updated_by: profile?.id })
        .eq("id", violationId);
      if (error) { Alert.alert("Error", error.message); return; }
    } else {
      const { data, error } = await supabase.from("violation_types")
        .insert({ name: form.name, description: form.description, default_severity: form.default_severity, category: form.category, updated_by: profile?.id })
        .select("id").single();
      if (error) { Alert.alert("Error", error.message); return; }
      violationId = data.id;
    }

    // Sync linked sanctions
    await supabase.from("violation_type_sanctions").delete().eq("violation_type_id", violationId);
    if (linkedIds.length > 0) {
      await supabase.from("violation_type_sanctions").insert(
        linkedIds.map(sid => ({ violation_type_id: violationId, sanction_id: sid }))
      );
    }

    setVModal(false);
    fetchViolations();
  };

  const handleVDelete = (item: ViolationType) => {
    Alert.alert("Delete", `Remove "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await supabase.from("violation_types").delete().eq("id", item.id); fetchViolations(); } },
    ]);
  };

  // ── Sanction CRUD ──
  const handleSSave = async (form: Partial<Sanction>) => {
    if (form.id) {
      const { error } = await supabase.from("sanctions")
        .update({ name: form.name, description: form.description, duration: form.duration, recommended_for: form.recommended_for, updated_by: profile?.id })
        .eq("id", form.id);
      if (error) { Alert.alert("Error", error.message); return; }
    } else {
      const { error } = await supabase.from("sanctions")
        .insert({ name: form.name, description: form.description, duration: form.duration, recommended_for: form.recommended_for, updated_by: profile?.id });
      if (error) { Alert.alert("Error", error.message); return; }
    }
    setSModal(false);
    fetchSanctions();
  };

  const handleSDelete = (item: Sanction) => {
    Alert.alert("Delete", `Remove "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await supabase.from("sanctions").delete().eq("id", item.id); fetchSanctions(); } },
    ]);
  };

  // ── Filter ──
  const filteredViolations = violations.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSanctions = sanctions.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const onFABPress = () => {
    if (activeTab === "violations") { setVEditing(null); setVModal(true); }
    else { setSEditing(null); setSModal(true); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* ── Header ── */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Manage Library</Text>
          {canEdit ? (
            <TouchableOpacity onPress={onFABPress}
              style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          ) : <View style={{ width: 30 }} />}
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row" }}>
          {([{ key: "violations" as Tab, label: "Violation Types" }, { key: "sanctions" as Tab, label: "Sanctions" }]).map(tab => (
            <TouchableOpacity key={tab.key} onPress={() => { setActiveTab(tab.key); setSearch(""); }}
              style={{ marginRight: 24, paddingBottom: 12, position: "relative" }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: activeTab === tab.key ? "#F59E0B" : "#94A3B8" }}>{tab.label}</Text>
              {activeTab === tab.key && (
                <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#F59E0B", borderRadius: 1 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Search ── */}
      <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Ionicons name="search-outline" size={16} color="#F59E0B" style={{ marginRight: 8 }} />
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder={activeTab === "violations" ? "Search violation types..." : "Search sanctions..."}
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, fontSize: 14, color: "#1E293B" }}
          />
          {!!search && <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}><Ionicons name="close-circle" size={16} color="#94A3B8" /></TouchableOpacity>}
        </View>
      </View>

      {/* ── List ── */}
      {activeTab === "violations" ? (
        vLoading ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#F59E0B" /></View> : (
          <FlatList
            data={filteredViolations} keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <ViolationCard item={item} canEdit={canEdit}
                onEdit={() => { setVEditing(item); setVModal(true); }}
                onDelete={() => handleVDelete(item)} />
            )}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<View style={{ alignItems: "center", paddingTop: 60 }}><Ionicons name="library-outline" size={48} color="#CBD5E1" /><Text style={{ color: "#94A3B8", marginTop: 12 }}>No violation types found.</Text></View>}
          />
        )
      ) : (
        sLoading ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#F59E0B" /></View> : (
          <FlatList
            data={filteredSanctions} keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <SanctionCard item={item} canEdit={canEdit}
                onEdit={() => { setSEditing(item); setSModal(true); }}
                onDelete={() => handleSDelete(item)} />
            )}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<View style={{ alignItems: "center", paddingTop: 60 }}><Ionicons name="shield-outline" size={48} color="#CBD5E1" /><Text style={{ color: "#94A3B8", marginTop: 12 }}>No sanctions found.</Text></View>}
          />
        )
      )}

      {/* ── FAB ── */}
      {canEdit && (
        <TouchableOpacity onPress={onFABPress}
          style={{ position: "absolute", bottom: 24 + insets.bottom, right: 20, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F59E0B", borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            {activeTab === "violations" ? "Add Type" : "Add Sanction"}
          </Text>
        </TouchableOpacity>
      )}

      {/* ── Modals ── */}
      <ViolationModal visible={vModal} initial={vEditing} allSanctions={sanctions} onClose={() => setVModal(false)} onSave={handleVSave} />
      <SanctionModal visible={sModal} initial={sEditing} onClose={() => setSModal(false)} onSave={handleSSave} />
    </View>
  );
}