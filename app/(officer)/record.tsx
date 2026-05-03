import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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

interface StudentProfile {
  id: string;
  full_name: string;
  student_id?: string;
  section?: string;
}

interface ViolationType {
  id: string;
  name: string;
  default_severity: Severity;
  category: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: Severity) => {
  switch (s) {
    case "Minor": return { bg: "#F59E0B", text: "#fff" };
    case "Major": return { bg: "#F97316", text: "#fff" };
    case "Severe": return { bg: "#EF4444", text: "#fff" };
  }
};

const initials = (name: string) =>
  name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

// Returns YYYY-MM-DD for DB date column
const formatDate = (d: Date) => d.toISOString().split("T")[0];

// Returns HH:MM:SS for DB time column
const formatTime = (d: Date) => d.toTimeString().split(" ")[0];

// Display-friendly for UI
const displayDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const displayTime = (hms: string) => {
  const [h, m] = hms.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
};

// ─── Drum Picker ──────────────────────────────────────────────────────────────

const ITEM_H = 44;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Drum({
  items,
  selected,
  onSelect,
}: {
  items: (string | number)[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      ref.current?.scrollTo({ y: selected * ITEM_H, animated: false });
    }, 50);
  }, [selected]);

  return (
    <View style={{ flex: 1, height: ITEM_H * 5, overflow: "hidden" }}>
      <View style={{
        position: "absolute", top: ITEM_H * 2, left: 4, right: 4,
        height: ITEM_H, backgroundColor: "#F1F5F9", borderRadius: 8, zIndex: 0,
      }} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          onSelect(Math.max(0, Math.min(i, items.length - 1)));
        }}
      >
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
              onSelect(i);
            }}
            style={{ height: ITEM_H, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: i === selected ? "700" : "400",
              color: i === selected ? "#1E293B" : "#94A3B8",
            }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Date Picker Modal ────────────────────────────────────────────────────────

function DatePickerModal({
  visible, value, onChange, onClose,
}: {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const now = new Date();
  const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() - 9 + i).filter(y => y <= now.getFullYear());
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const parsed = value ? new Date(value + "T00:00:00") : now;
  const [monthIdx, setMonthIdx] = useState(parsed.getMonth());
  const [dayIdx,   setDayIdx]   = useState(parsed.getDate() - 1);
  const [yearIdx,  setYearIdx]  = useState(Math.max(0, years.indexOf(parsed.getFullYear())));

  useEffect(() => {
    if (visible) {
      const d = value ? new Date(value + "T00:00:00") : now;
      setMonthIdx(d.getMonth());
      setDayIdx(d.getDate() - 1);
      setYearIdx(Math.max(0, years.indexOf(d.getFullYear())));
    }
  }, [visible]);

  const handleDone = () => {
    const y = years[yearIdx];
    const m = monthIdx + 1;
    const d = dayIdx + 1;
    onChange(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={{
        backgroundColor: "#fff",
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingBottom: 40,
        position: "absolute", bottom: 0, left: 0, right: 0,
      }}>
        {/* Handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" }} />
        </View>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 8 }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 15, color: "#64748B", fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#1E293B" }}>Select Date</Text>
          <TouchableOpacity onPress={handleDone}>
            <Text style={{ fontSize: 15, color: "#F59E0B", fontWeight: "700" }}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Column labels */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16, marginBottom: 4 }}>
          {["Month", "Day", "Year"].map(l => (
            <Text key={l} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 1 }}>{l.toUpperCase()}</Text>
          ))}
        </View>

        {/* Drums */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
          <Drum items={MONTHS} selected={monthIdx} onSelect={setMonthIdx} />
          <Drum items={days}   selected={dayIdx}   onSelect={setDayIdx} />
          <Drum items={years}  selected={yearIdx}  onSelect={setYearIdx} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Time Picker Modal ────────────────────────────────────────────────────────

function TimePickerModal({
  visible, value, onChange, onClose,
}: {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const parseT = (hms: string) => {
    const [h, m] = (hms || "08:00:00").split(":").map(Number);
    return { hourIdx: (h % 12 || 12) - 1, minIdx: m, period: h >= 12 ? 1 : 0 };
  };

  const init = parseT(value);
  const [hourIdx, setHourIdx] = useState(init.hourIdx);
  const [minIdx,  setMinIdx]  = useState(init.minIdx);
  const [period,  setPeriod]  = useState(init.period);

  useEffect(() => {
    if (visible) {
      const p = parseT(value);
      setHourIdx(p.hourIdx);
      setMinIdx(p.minIdx);
      setPeriod(p.period);
    }
  }, [visible]);

  const hours   = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  const handleDone = () => {
    let h = hourIdx + 1;
    if (period === 1 && h !== 12) h += 12;
    if (period === 0 && h === 12) h = 0;
    onChange(`${String(h).padStart(2, "0")}:${String(minIdx).padStart(2, "0")}:00`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={{
        backgroundColor: "#fff",
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingBottom: 40,
        position: "absolute", bottom: 0, left: 0, right: 0,
      }}>
        {/* Handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" }} />
        </View>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 8 }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 15, color: "#64748B", fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#1E293B" }}>Select Time</Text>
          <TouchableOpacity onPress={handleDone}>
            <Text style={{ fontSize: 15, color: "#F59E0B", fontWeight: "700" }}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Column labels */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16, marginBottom: 4 }}>
          {["Hour", "Minute", ""].map((l, i) => (
            <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 1 }}>{l.toUpperCase()}</Text>
          ))}
        </View>

        {/* Drums */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
          <Drum items={hours}        selected={hourIdx} onSelect={setHourIdx} />
          <Drum items={minutes}      selected={minIdx}  onSelect={setMinIdx} />
          <Drum items={["AM", "PM"]} selected={period}  onSelect={setPeriod} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>
      {label}
    </Text>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RecordViolation() {
  const router = useRouter();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();

  // ── Student search ──
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [studentSearch,   setStudentSearch]   = useState("");
  const [studentResults,  setStudentResults]  = useState<StudentProfile[]>([]);
  const [searchLoading,   setSearchLoading]   = useState(false);

  // ── Violation type ──
  const [violationTypes,     setViolationTypes]     = useState<ViolationType[]>([]);
  const [selectedViolation,  setSelectedViolation]  = useState<ViolationType | null>(null);
  const [showViolationPicker,setShowViolationPicker] = useState(false);

  // ── Severity ──
  const [severity,   setSeverity]   = useState<Severity | null>(null);
  const [overriding, setOverriding] = useState(false);

  // ── Date / Time ──
  const [date,          setDate]          = useState(formatDate(new Date()));
  const [time,          setTime]          = useState(formatTime(new Date()));
  const [showDatePicker,setShowDatePicker] = useState(false);
  const [showTimePicker,setShowTimePicker] = useState(false);

  // ── Other fields ──
  const [location,    setLocation]    = useState("");
  const [description, setDescription] = useState("");
  const MAX_DESC = 500;

  // ── UI state ──
  const [submitting,  setSubmitting]  = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const searchTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load violation types ──
  useEffect(() => {
    supabase
      .from("violation_types")
      .select("id, name, default_severity, category")
      .order("name")
      .then(({ data }) => setViolationTypes(data ?? []));
  }, []);

  // ── Student search debounce ──
  useEffect(() => {
    if (!studentSearch.trim()) { setStudentResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, student_id, section")
        .eq("role", "student")
        .or(`full_name.ilike.%${studentSearch}%,student_id.ilike.%${studentSearch}%`)
        .limit(5);
      setStudentResults(data ?? []);
      setSearchLoading(false);
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [studentSearch]);

  const selectStudent = (s: StudentProfile) => {
    setSelectedStudent(s);
    setStudentSearch("");
    setStudentResults([]);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch("");
  };

  const selectViolation = (v: ViolationType) => {
    setSelectedViolation(v);
    setSeverity(v.default_severity);
    setOverriding(false);
    setShowViolationPicker(false);
  };

  // ── Success banner ──
  const triggerSuccess = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(successOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  };

  // ── Reset form ──
  const resetForm = () => {
    setSelectedStudent(null);
    setSelectedViolation(null);
    setSeverity(null);
    setOverriding(false);
    setLocation("");
    setDescription("");
    setDate(formatDate(new Date()));
    setTime(formatTime(new Date()));
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!selectedStudent)  { Alert.alert("Validation", "Please select a student."); return; }
    if (!selectedViolation){ Alert.alert("Validation", "Please select a violation type."); return; }
    if (!description.trim()){ Alert.alert("Validation", "Please provide a description."); return; }

    setSubmitting(true);
    const { error } = await supabase.from("student_violations").insert({
      student_id:       selectedStudent.id,
      violation_type_id: selectedViolation.id,
      recorded_by:      profile?.id,
      severity:         severity ?? selectedViolation.default_severity,
      date_of_incident: date,
      time_of_incident: time,
      location:         location.trim() || null,
      description:      description.trim(),
      status:           "pending",
    });
    setSubmitting(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      triggerSuccess();
      resetForm();
    }
  };

  const sc = severity ? severityStyle(severity) : null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ── Header ── */}
      <View style={{
        backgroundColor: "#1E293B",
        paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Record Violation</Text>
        <TouchableOpacity hitSlop={8}>
          <Text style={{ color: "#F59E0B", fontSize: 13, fontWeight: "700" }}>Save Draft</Text>
        </TouchableOpacity>
      </View>

      {/* ── Success Banner ── */}
      {showSuccess && (
        <Animated.View style={{
          opacity: successOpacity, backgroundColor: "#1E293B",
          marginHorizontal: 16, marginTop: 12, borderRadius: 10,
          flexDirection: "row", alignItems: "center", gap: 10,
          paddingHorizontal: 14, paddingVertical: 12,
        }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Violation recorded. History updated.</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Student ── */}
          <SectionLabel label="STUDENT" />

          {!selectedStudent && (
            <View style={{ marginBottom: 8 }}>
              <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 }}>
                <Ionicons name="person-outline" size={16} color="#94A3B8" style={{ marginRight: 10 }} />
                <TextInput
                  value={studentSearch}
                  onChangeText={setStudentSearch}
                  placeholder="Search student by name or ID..."
                  placeholderTextColor="#94A3B8"
                  style={{ flex: 1, fontSize: 14, color: "#1E293B" }}
                />
                {searchLoading && <ActivityIndicator size="small" color="#94A3B8" />}
              </View>

              {studentResults.length > 0 && (
                <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, marginTop: 4, overflow: "hidden" }}>
                  {studentResults.map((s, i) => (
                    <TouchableOpacity key={s.id} onPress={() => selectStudent(s)}
                      style={{ flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: i < studentResults.length - 1 ? 1 : 0, borderBottomColor: "#F1F5F9" }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{initials(s.full_name)}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E293B" }}>{s.full_name}</Text>
                        <Text style={{ fontSize: 12, color: "#94A3B8" }}>
                          {s.student_id ? `ID: #${s.student_id}` : ""}
                          {s.section ? ` • Section ${s.section}` : ""}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {selectedStudent && (
            <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 20 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{initials(selectedStudent.full_name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B" }}>{selectedStudent.full_name}</Text>
                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  {selectedStudent.student_id ? `ID: #${selectedStudent.student_id}` : ""}
                  {selectedStudent.section ? ` • Section ${selectedStudent.section}` : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={clearStudent} hitSlop={8}
                style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Violation Details ── */}
          <SectionLabel label="VIOLATION DETAILS" />
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 6 }}>VIOLATION TYPE</Text>

          <TouchableOpacity
            onPress={() => setShowViolationPicker(!showViolationPicker)}
            style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14, marginBottom: 4 }}
          >
            <Text style={{ fontSize: 14, color: selectedViolation ? "#1E293B" : "#94A3B8", flex: 1 }}>
              {selectedViolation?.name ?? "Select violation type..."}
            </Text>
            <Ionicons name={showViolationPicker ? "chevron-up" : "chevron-down"} size={18} color="#94A3B8" />
          </TouchableOpacity>

          {showViolationPicker && (
            <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, marginBottom: 8, maxHeight: 200, overflow: "hidden" }}>
              <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {violationTypes.map((v, i) => (
                  <TouchableOpacity key={v.id} onPress={() => selectViolation(v)}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 13, borderBottomWidth: i < violationTypes.length - 1 ? 1 : 0, borderBottomColor: "#F8FAFC", backgroundColor: selectedViolation?.id === v.id ? "#F8FAFC" : "#fff" }}>
                    <Text style={{ fontSize: 14, color: "#1E293B", flex: 1 }}>{v.name}</Text>
                    <View style={{ backgroundColor: severityStyle(v.default_severity).bg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 9, fontWeight: "700", color: "#fff" }}>{v.default_severity.toUpperCase()}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedViolation && sc && !overriding && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 4 }}>
              <View style={{ backgroundColor: sc.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                <Text style={{ color: sc.text, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 }}>{severity?.toUpperCase()}</Text>
              </View>
              <Text style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>Auto-assigned</Text>
              <TouchableOpacity onPress={() => setOverriding(true)}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E293B", textDecorationLine: "underline" }}>Override</Text>
              </TouchableOpacity>
            </View>
          )}

          {overriding && (
            <View style={{ marginBottom: 16, marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>Select severity override:</Text>
              <View style={{ flexDirection: "row", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, overflow: "hidden" }}>
                {(["Minor", "Major", "Severe"] as Severity[]).map((s) => {
                  const active = severity === s;
                  const st = severityStyle(s);
                  return (
                    <TouchableOpacity key={s} onPress={() => setSeverity(s)}
                      style={{ flex: 1, paddingVertical: 11, alignItems: "center", backgroundColor: active ? st.bg : "#fff" }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: active ? "#fff" : "#94A3B8" }}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Date & Time ── */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 6 }}>DATE</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 14 }}
              >
                <Text style={{ flex: 1, fontSize: 13, color: "#1E293B" }}>{displayDate(date)}</Text>
                <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 6 }}>TIME</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 14 }}
              >
                <Text style={{ flex: 1, fontSize: 13, color: "#1E293B" }}>{displayTime(time)}</Text>
                <Ionicons name="time-outline" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Pickers ── */}
          <DatePickerModal
            visible={showDatePicker}
            value={date}
            onChange={setDate}
            onClose={() => setShowDatePicker(false)}
          />
          <TimePickerModal
            visible={showTimePicker}
            value={time}
            onChange={setTime}
            onClose={() => setShowTimePicker(false)}
          />

          {/* ── Location ── */}
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 6 }}>LOCATION</Text>
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 }}>
            <Ionicons name="location-outline" size={16} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Room 302, Cafeteria"
              placeholderTextColor="#94A3B8"
              style={{ flex: 1, fontSize: 14, color: "#1E293B" }}
            />
          </View>

          {/* ── Description ── */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", letterSpacing: 0.5 }}>DESCRIPTION</Text>
            <Text style={{ fontSize: 11, color: description.length > MAX_DESC * 0.8 ? "#EF4444" : "#94A3B8" }}>
              {description.length}/{MAX_DESC}
            </Text>
          </View>
          <TextInput
            value={description}
            onChangeText={t => { if (t.length <= MAX_DESC) setDescription(t); }}
            placeholder="Provide detailed context of the incident..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#1E293B", minHeight: 120, marginBottom: 16 }}
          />

          {/* ── Evidence ── */}
          <SectionLabel label="EVIDENCE" />
          <TouchableOpacity
            onPress={() => Alert.alert("Upload", "File upload coming soon.")}
            style={{ backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0", borderStyle: "dashed", borderRadius: 10, alignItems: "center", justifyContent: "center", paddingVertical: 28 }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <Ionicons name="camera-outline" size={22} color="#6366F1" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 4 }}>Upload Photos or Files</Text>
            <Text style={{ fontSize: 12, color: "#94A3B8" }}>Maximum file size 10MB</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Submit ── */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12 }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{ backgroundColor: "#1E293B", borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center" }}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Submit Violation</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}