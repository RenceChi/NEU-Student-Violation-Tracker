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
type RecommendedFor = "Minor" | "Major" | "Severe";

interface ViolationType {
  id: string;
  name: string;
  description: string;
  default_severity: Severity;
  category: Category;
  created_at: string;
  updated_at?: string;
}

interface Sanction {
  id: string;
  name: string;
  description: string;
  duration: string;
  recommended_for: RecommendedFor;
  created_at: string;
  updated_at?: string;
}

const SEVERITIES: Severity[] = ["Minor", "Major", "Severe"];
const CATEGORIES: Category[] = ["Conduct", "Attendance", "Facilities", "Safety"];
const RECOMMENDED_FOR: RecommendedFor[] = ["Minor", "Major", "Severe"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityConfig = (s: Severity) => {
  switch (s) {
    case "Minor":  return { border: "#22C55E", dot: "#22C55E", badge: "#DCFCE7", badgeText: "#15803D" };
    case "Major":  return { border: "#F59E0B", dot: "#F59E0B", badge: "#FEF3C7", badgeText: "#B45309" };
    case "Severe": return { border: "#EF4444", dot: "#EF4444", badge: "#FEE2E2", badgeText: "#B91C1C" };
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 14) return "1w ago";
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const emptyViolation = (): Partial<ViolationType> => ({
  name: "", description: "", default_severity: "Minor", category: "Conduct",
});

const emptySanction = (): Partial<Sanction> => ({
  name: "", description: "", duration: "", recommended_for: "Minor",
});

// ─── Chip Selector ────────────────────────────────────────────────────────────

function ChipSelector<T extends string>({
  options, selected, onSelect,
}: { options: T[]; selected: T; onSelect: (v: T) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => (
        <TouchableOpacity
          key={o} onPress={() => onSelect(o)}
          style={{
            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
            backgroundColor: selected === o ? "#2563EB" : "#fff",
            borderWidth: 1, borderColor: selected === o ? "#2563EB" : "#E2E8F0",
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: selected === o ? "#fff" : "#64748B" }}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Violation Modal ──────────────────────────────────────────────────────────

function ViolationModal({ visible, initial, onClose, onSave }: {
  visible: boolean; initial: Partial<ViolationType> | null;
  onClose: () => void; onSave: (d: Partial<ViolationType>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<ViolationType>>(emptyViolation());
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial ?? emptyViolation()); }, [initial, visible]);
  const set = (k: keyof ViolationType, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim()) { Alert.alert("Validation", "Name is required."); return; }
    setSaving(true); await onSave(form); setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
          <TouchableOpacity onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B" }}>{initial?.id ? "Edit Violation Type" : "New Violation Type"}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={8}>
            {saving ? <ActivityIndicator size="small" color="#2563EB" /> : <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 14 }}>{initial?.id ? "Update" : "Add"}</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>VIOLATION NAME *</Text>
          <TextInput value={form.name} onChangeText={v => set("name", v)} placeholder="e.g. Academic Dishonesty" placeholderTextColor="#94A3B8" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#1E293B", marginBottom: 20 }} />
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>DESCRIPTION</Text>
          <TextInput value={form.description} onChangeText={v => set("description", v)} placeholder="Describe the violation..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} textAlignVertical="top" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#1E293B", marginBottom: 20, minHeight: 80 }} />
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>SEVERITY</Text>
          <ChipSelector options={SEVERITIES} selected={form.default_severity ?? "Minor"} onSelect={v => set("default_severity", v)} />
          <View style={{ height: 20 }} />
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>CATEGORY</Text>
          <ChipSelector options={CATEGORIES} selected={form.category ?? "Conduct"} onSelect={v => set("category", v)} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Sanction Modal ───────────────────────────────────────────────────────────

function SanctionModal({ visible, initial, onClose, onSave }: {
  visible: boolean; initial: Partial<Sanction> | null;
  onClose: () => void; onSave: (d: Partial<Sanction>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Sanction>>(emptySanction());
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial ?? emptySanction()); }, [initial, visible]);
  const set = (k: keyof Sanction, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim()) { Alert.alert("Validation", "Name is required."); return; }
    setSaving(true); await onSave(form); setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
          <TouchableOpacity onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B" }}>{initial?.id ? "Edit Sanction" : "New Sanction"}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={8}>
            {saving ? <ActivityIndicator size="small" color="#2563EB" /> : <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 14 }}>{initial?.id ? "Update" : "Add"}</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>SANCTION NAME *</Text>
          <TextInput value={form.name} onChangeText={v => set("name", v)} placeholder="e.g. Written Warning" placeholderTextColor="#94A3B8" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#1E293B", marginBottom: 20 }} />
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>DESCRIPTION</Text>
          <TextInput value={form.description} onChangeText={v => set("description", v)} placeholder="Describe the sanction..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} textAlignVertical="top" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#1E293B", marginBottom: 20, minHeight: 80 }} />
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>DURATION</Text>
          <TextInput value={form.duration} onChangeText={v => set("duration", v)} placeholder="e.g. 1-3 Days, Permanent" placeholderTextColor="#94A3B8" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#1E293B", marginBottom: 20 }} />
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>RECOMMENDED FOR</Text>
          <ChipSelector options={RECOMMENDED_FOR} selected={form.recommended_for ?? "Minor"} onSelect={v => set("recommended_for", v)} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Violation Card ───────────────────────────────────────────────────────────

function ViolationCard({ item, canEdit, onEdit, onDelete }: {
  item: ViolationType; canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const sc = severityConfig(item.default_severity);

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
    <View style={{ backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, marginHorizontal: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, flexDirection: "row", overflow: "hidden" }}>
      {/* Severity left border */}
      <View style={{ width: 4, backgroundColor: sc.border }} />
      <View style={{ flex: 1, padding: 14 }}>
        {/* Title + menu */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B", flex: 1, marginRight: 8 }} numberOfLines={1}>{item.name}</Text>
          {canEdit && (
            <TouchableOpacity onPress={showMenu} hitSlop={8}>
              <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category + Severity badges */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <View style={{ backgroundColor: "#F1F5F9", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", letterSpacing: 0.5 }}>{item.category.toUpperCase()}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: sc.badge, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sc.dot }} />
            <Text style={{ fontSize: 10, fontWeight: "700", color: sc.badgeText, letterSpacing: 0.5 }}>{item.default_severity.toUpperCase()}</Text>
          </View>
        </View>

        {/* Description */}
        {!!item.description && (
          <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 19, marginBottom: 10 }} numberOfLines={3}>{item.description}</Text>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#F1F5F9", marginBottom: 8 }} />

        {/* Footer */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
              System Updated • {timeAgo(item.updated_at ?? item.created_at)}
            </Text>
          </View>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#1E293B" }}>Details</Text>
            <Ionicons name="chevron-forward" size={12} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Sanction Card ────────────────────────────────────────────────────────────

function SanctionCard({ item, canEdit, onEdit, onDelete }: {
  item: Sanction; canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const sc = severityConfig(item.recommended_for);

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
    <View style={{ backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, marginHorizontal: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, flexDirection: "row", overflow: "hidden" }}>
      {/* Severity left border */}
      <View style={{ width: 4, backgroundColor: sc.border }} />
      <View style={{ flex: 1, padding: 14 }}>
        {/* Title + menu */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B", flex: 1, marginRight: 8 }} numberOfLines={1}>{item.name}</Text>
          {canEdit && (
            <TouchableOpacity onPress={showMenu} hitSlop={8}>
              <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {!!item.description && (
          <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 19, marginBottom: 10 }} numberOfLines={3}>{item.description}</Text>
        )}

        {/* Duration + Recommended badge */}
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {!!item.duration && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F1F5F9", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Ionicons name="time" size={12} color="#64748B" />
              <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Duration: {item.duration}</Text>
            </View>
          )}
          <View style={{ backgroundColor: sc.badge, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ fontSize: 10, fontWeight: "800", color: sc.badgeText, letterSpacing: 0.5 }}>
              RECOMMENDED FOR: {item.recommended_for.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#F1F5F9", marginBottom: 8 }} />

        {/* Footer */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
              System default • {timeAgo(item.updated_at ?? item.created_at)}
            </Text>
          </View>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#1E293B" }}>Details</Text>
            <Ionicons name="chevron-forward" size={12} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Tab = "violations" | "sanctions";

export default function LibraryScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const canEdit = profile?.role === "admin" || profile?.role === "officer";

  const [activeTab, setActiveTab] = useState<Tab>("violations");
  const [search, setSearch] = useState("");

  // Violations state
  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [vLoading, setVLoading] = useState(true);
  const [vModal, setVModal] = useState(false);
  const [vEditing, setVEditing] = useState<Partial<ViolationType> | null>(null);

  // Sanctions state
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [sLoading, setSLoading] = useState(true);
  const [sModal, setSModal] = useState(false);
  const [sEditing, setSEditing] = useState<Partial<Sanction> | null>(null);

  // ── Fetch violations ──
  const fetchViolations = async () => {
    const { data, error } = await supabase.from("violation_types").select("*").order("category").order("name");
    if (error) Alert.alert("Error", error.message);
    else setViolations(data ?? []);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setVLoading(true);
      const { data, error } = await supabase.from("violation_types").select("*").order("category").order("name");
      if (!active) return;
      if (error) Alert.alert("Error", error.message);
      else setViolations(data ?? []);
      setVLoading(false);
    };
    load();
    return () => { active = false; };
  }, []);

  // ── Fetch sanctions ──
  const fetchSanctions = async () => {
    const { data, error } = await supabase.from("sanctions").select("*").order("recommended_for").order("name");
    if (error) Alert.alert("Error", error.message);
    else setSanctions(data ?? []);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setSLoading(true);
      const { data, error } = await supabase.from("sanctions").select("*").order("recommended_for").order("name");
      if (!active) return;
      if (error) Alert.alert("Error", error.message);
      else setSanctions(data ?? []);
      setSLoading(false);
    };
    load();
    return () => { active = false; };
  }, []);

  // ── Violation CRUD ──
  const handleVSave = async (form: Partial<ViolationType>) => {
    if (form.id) {
      const { error } = await supabase.from("violation_types").update({ name: form.name, description: form.description, default_severity: form.default_severity, category: form.category }).eq("id", form.id);
      if (error) { Alert.alert("Error", error.message); return; }
    } else {
      const { error } = await supabase.from("violation_types").insert({ name: form.name, description: form.description, default_severity: form.default_severity, category: form.category });
      if (error) { Alert.alert("Error", error.message); return; }
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
      const { error } = await supabase.from("sanctions").update({ name: form.name, description: form.description, duration: form.duration, recommended_for: form.recommended_for }).eq("id", form.id);
      if (error) { Alert.alert("Error", error.message); return; }
    } else {
      const { error } = await supabase.from("sanctions").insert({ name: form.name, description: form.description, duration: form.duration, recommended_for: form.recommended_for });
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

  // ── Filtered lists ──
  const filteredViolations = violations.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.description?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSanctions = sanctions.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const onFABPress = () => {
    if (activeTab === "violations") { setVEditing(null); setVModal(true); }
    else { setSEditing(null); setSModal(true); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ── Dark Navy Header ── */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Manage Library</Text>
          {canEdit ? (
            <TouchableOpacity
              onPress={onFABPress}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          ) : <View style={{ width: 32 }} />}
        </View>

        {/* Tab bar */}
        <View style={{ flexDirection: "row" }}>
          {([
            { key: "violations" as Tab, label: "Violation Types" },
            { key: "sanctions" as Tab, label: "Sanctions" },
          ]).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => { setActiveTab(tab.key); setSearch(""); }}
              style={{ marginRight: 24, paddingBottom: 12, position: "relative" }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: activeTab === tab.key ? "#F59E0B" : "#94A3B8" }}>
                {tab.label}
              </Text>
              {activeTab === tab.key && (
                <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#F59E0B", borderRadius: 1 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Search bar ── */}
      <View style={{ backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#fff" }}>
          <Ionicons name="search-outline" size={16} color="#F59E0B" style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={activeTab === "violations" ? "Search violation types..." : "Search sanctions..."}
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, fontSize: 14, color: "#1E293B" }}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── List content ── */}
      {activeTab === "violations" ? (
        vLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : (
          <FlatList
            data={filteredViolations}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <ViolationCard
                item={item} canEdit={canEdit}
                onEdit={() => { setVEditing(item); setVModal(true); }}
                onDelete={() => handleVDelete(item)}
              />
            )}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
                <Ionicons name="library-outline" size={48} color="#CBD5E1" />
                <Text style={{ color: "#94A3B8", marginTop: 12, fontSize: 14 }}>No violation types found.</Text>
              </View>
            }
          />
        )
      ) : (
        sLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : (
          <FlatList
            data={filteredSanctions}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <SanctionCard
                item={item} canEdit={canEdit}
                onEdit={() => { setSEditing(item); setSModal(true); }}
                onDelete={() => handleSDelete(item)}
              />
            )}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
                <Ionicons name="shield-outline" size={48} color="#CBD5E1" />
                <Text style={{ color: "#94A3B8", marginTop: 12, fontSize: 14 }}>No sanctions found.</Text>
              </View>
            }
          />
        )
      )}

      {/* ── Floating FAB ── */}
      {canEdit && (
        <TouchableOpacity
          onPress={onFABPress}
          style={{
            position: "absolute", bottom: 24 + insets.bottom, right: 20,
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: "#1E293B",
            alignItems: "center", justifyContent: "center",
            shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 }, elevation: 6,
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ── Modals ── */}
      <ViolationModal visible={vModal} initial={vEditing} onClose={() => setVModal(false)} onSave={handleVSave} />
      <SanctionModal visible={sModal} initial={sEditing} onClose={() => setSModal(false)} onSave={handleSSave} />
    </View>
  );
}