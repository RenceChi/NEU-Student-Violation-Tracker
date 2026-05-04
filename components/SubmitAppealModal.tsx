/**
 * SubmitAppealModal
 *
 * Rendered from the student violations tab when tapping "Appeal" on a pending violation.
 * Props:
 *   visible        — controls modal visibility
 *   violationId    — the violation being appealed
 *   violationName  — displayed as context at the top
 *   severity       — displayed as a badge
 *   date           — incident date string (YYYY-MM-DD)
 *   sanction       — sanction name if assigned
 *   onClose        — called when user cancels or after successful submit
 *   onSubmitted    — called after successful insert so parent can refresh
 */

import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Options ──────────────────────────────────────────────────────────────────

const REASONS = [
  "Procedural Error",
  "Evidence Discrepancy",
  "Misidentification",
  "Disproportionate Sanction",
  "New Evidence Available",
  "Other",
];

const RESOLUTIONS = [
  "Re-evaluation of Sanction",
  "Dismissal of Violation",
  "Reduction of Sanction",
  "Record Expungement",
  "Other",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (s: string) => {
  switch (s) {
    case "Minor":  return { bg: "#FEF3C7", text: "#92400E" };
    case "Major":  return { bg: "#FEE9D9", text: "#9A3412" };
    case "Severe": return { bg: "#FEE2E2", text: "#991B1B" };
    default:       return { bg: "#F1F5F9", text: "#475569" };
  }
};

const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function Dropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        style={{
          borderWidth: 1,
          borderColor: value ? "#1E293B" : "#E2E8F0",
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 13,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 14, color: value ? "#1E293B" : "#CBD5E1", flex: 1 }}>
          {value || placeholder}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
      </TouchableOpacity>

      {open && (
        <View style={{
          borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10,
          marginTop: 4, overflow: "hidden", backgroundColor: "#fff",
        }}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              onPress={() => { onChange(opt); setOpen(false); }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 13,
                borderBottomWidth: i < options.length - 1 ? 1 : 0,
                borderBottomColor: "#F8FAFC",
                backgroundColor: value === opt ? "#F8FAFC" : "#fff",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 14, color: "#1E293B", fontWeight: value === opt ? "600" : "400" }}>
                {opt}
              </Text>
              {value === opt && (
                <Ionicons name="checkmark" size={16} color="#F59E0B" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  violationId: string;
  violationName: string;
  severity: string;
  date: string;
  sanction?: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function SubmitAppealModal({
  visible,
  violationId,
  violationName,
  severity,
  date,
  sanction,
  onClose,
  onSubmitted,
}: Props) {
  const { profile } = useAuth();

  const [reason,      setReason]      = useState("");
  const [explanation, setExplanation] = useState("");
  const [resolution,  setResolution]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  const sv = severityStyle(severity);

  const reset = () => {
    setReason("");
    setExplanation("");
    setResolution("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert("Required", "Please select a reason for your appeal.");
      return;
    }
    if (!explanation.trim()) {
      Alert.alert("Required", "Please provide an explanation for your appeal.");
      return;
    }

    setSubmitting(true);

    // Insert appeal record
    const { error: appealError } = await supabase.from("appeals").insert({
      violation_id:         violationId,
      student_id:           profile?.id,
      reason,
      explanation:          explanation.trim(),
      preferred_resolution: resolution || null,
      status:               "pending",
    });

    if (appealError) {
      Alert.alert("Error", appealError.message);
      setSubmitting(false);
      return;
    }

    // Update violation status to appealed
    const { error: statusError } = await supabase
      .from("student_violations")
      .update({ status: "appealed" })
      .eq("id", violationId);

    if (statusError) {
      Alert.alert("Error", statusError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    reset();
    onSubmitted();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        {/* Drag handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" }} />
        </View>

        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
        }}>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#64748B" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1E293B" }}>
            Submit Appeal
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Violation context card */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 8 }}>
            UNDER REVIEW VIOLATION
          </Text>
          <View style={{
            backgroundColor: "#F8FAFC", borderRadius: 10, padding: 14,
            borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 24,
          }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 10 }}>
              {violationName}
            </Text>
            <View style={{ flexDirection: "row", gap: 20 }}>
              <View>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 3 }}>DATE</Text>
                <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600" }}>{formatDate(date)}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 3 }}>SEVERITY</Text>
                <View style={{ backgroundColor: sv.bg, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: sv.text }}>{severity.toUpperCase()}</Text>
                </View>
              </View>
              {!!sanction && (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 3 }}>SANCTION</Text>
                  <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600" }} numberOfLines={1}>{sanction}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Reason dropdown */}
          <Dropdown
            label="REASON FOR APPEAL"
            placeholder="Select a reason..."
            options={REASONS}
            value={reason}
            onChange={setReason}
          />

          {/* Explanation */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>
            ADDITIONAL EXPLANATION
          </Text>
          <TextInput
            value={explanation}
            onChangeText={setExplanation}
            placeholder="Provide a detailed account of your appeal grounds..."
            placeholderTextColor="#CBD5E1"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={{
              borderWidth: 1,
              borderColor: explanation ? "#1E293B" : "#E2E8F0",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 13,
              fontSize: 14,
              color: "#1E293B",
              minHeight: 120,
              marginBottom: 16,
            }}
          />

          {/* Supporting evidence placeholder */}
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>
            SUPPORTING EVIDENCE
          </Text>
          <TouchableOpacity
            onPress={() => Alert.alert("Coming Soon", "File upload will be available in a future update.")}
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1.5,
              borderColor: "#E2E8F0",
              borderStyle: "dashed",
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 24,
              marginBottom: 16,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "#EEF2FF",
              alignItems: "center", justifyContent: "center", marginBottom: 8,
            }}>
              <Ionicons name="cloud-upload-outline" size={20} color="#6366F1" />
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 3 }}>
              Tap to upload files or photos
            </Text>
            <Text style={{ fontSize: 11, color: "#94A3B8" }}>
              PDF, JPG, or PNG (max 10MB)
            </Text>
          </TouchableOpacity>

          {/* Preferred resolution dropdown */}
          <Dropdown
            label="PREFERRED RESOLUTION"
            placeholder="Select outcome..."
            options={RESOLUTIONS}
            value={resolution}
            onChange={setResolution}
          />

          {/* Review process info */}
          <View style={{
            backgroundColor: "#F8FAFC", borderRadius: 10, padding: 14,
            borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 24,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>
              REVIEW PROCESS
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>
              Appeals are automatically routed to the Honor Committee for preliminary review.
              You will receive a notification once a reviewer has been assigned to your case.
            </Text>
          </View>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#475569" : "#1E293B",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Submit Appeal</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}