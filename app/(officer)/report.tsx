import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  total: number;
  pending: number;
  resolved: number;
  appealed: number;
  minor: number;
  major: number;
  severe: number;
  byCategory: { category: string; count: number }[];
  topViolations: { name: string; count: number }[];
  recentMonths: { month: string; count: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

const monthLabel = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

// ─── Bar ─────────────────────────────────────────────────────────────────────

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max === 0 ? 0 : (value / max) * 100;
  return (
    <View style={{ flex: 1, height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
      <View style={{ width: `${w}%`, height: "100%", backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
      {label}
    </Text>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Reports() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"30" | "90" | "365">("30");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);

      const since = new Date();
      since.setDate(since.getDate() - parseInt(range));
      const sinceStr = since.toISOString().split("T")[0];

      const { data: rows, error } = await supabase
        .from("student_violations")
        .select(`
          id, severity, status, date_of_incident,
          violation_type:violation_type_id(name, category)
        `)
        .gte("date_of_incident", sinceStr);

      if (error || !rows) {
        setLoading(false);
        return;
      }

      const total    = rows.length;
      const pending  = rows.filter((r) => r.status === "pending").length;
      const resolved = rows.filter((r) => r.status === "resolved").length;
      const appealed = rows.filter((r) => r.status === "appealed").length;
      const minor    = rows.filter((r) => r.severity === "Minor").length;
      const major    = rows.filter((r) => r.severity === "Major").length;
      const severe   = rows.filter((r) => r.severity === "Severe").length;

      // By category
      const catMap: Record<string, number> = {};
      rows.forEach((r: any) => {
        const cat = r.violation_type?.category ?? "Other";
        catMap[cat] = (catMap[cat] ?? 0) + 1;
      });
      const byCategory = Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Top violations
      const vtMap: Record<string, number> = {};
      rows.forEach((r: any) => {
        const name = r.violation_type?.name ?? "Unknown";
        vtMap[name] = (vtMap[name] ?? 0) + 1;
      });
      const topViolations = Object.entries(vtMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Monthly breakdown (last 6 months buckets)
      const monthMap: Record<string, number> = {};
      rows.forEach((r) => {
        const key = monthLabel(r.date_of_incident);
        monthMap[key] = (monthMap[key] ?? 0) + 1;
      });
      const recentMonths = Object.entries(monthMap)
        .map(([month, count]) => ({ month, count }))
        .slice(-6);

      setData({ total, pending, resolved, appealed, minor, major, severe, byCategory, topViolations, recentMonths });
      setLoading(false);
    };

    fetchReport();
  }, [range]);

  const maxMonth = data ? Math.max(...data.recentMonths.map((m) => m.count), 1) : 1;
  const maxCat   = data ? Math.max(...data.byCategory.map((c) => c.count), 1) : 1;
  const maxVt    = data ? Math.max(...data.topViolations.map((v) => v.count), 1) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: "#1E293B",
          paddingTop: insets.top + 8,
          paddingBottom: 20,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>Reports</Text>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => Alert.alert("Export", "CSV export coming soon.")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#F59E0B",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Ionicons name="download-outline" size={14} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Export</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Range selector */}
        <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 3 }}>
          {([["30", "Last 30d"], ["90", "Last 90d"], ["365", "This Year"]] as const).map(([val, label]) => (
            <TouchableOpacity
              key={val}
              onPress={() => setRange(val)}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: 8,
                backgroundColor: range === val ? "#F59E0B" : "transparent",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: range === val ? "#fff" : "#64748B" }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : !data ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#94A3B8" }}>Failed to load report data.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        >
          {/* ── Summary ── */}
          <SectionHeader label="SUMMARY" />
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            {[
              { label: "TOTAL",    value: data.total,    bg: "#1E293B", text: "#fff" },
              { label: "PENDING",  value: data.pending,  bg: "#FEF3C7", text: "#92400E" },
              { label: "RESOLVED", value: data.resolved, bg: "#D1FAE5", text: "#065F46" },
            ].map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: s.bg,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: "800", color: s.text }}>{s.value}</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color: s.text, opacity: 0.7, marginTop: 2 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Severity breakdown ── */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B", marginBottom: 14 }}>
              By Severity
            </Text>
            {[
              { label: "Minor",  value: data.minor,  color: "#F59E0B" },
              { label: "Major",  value: data.major,  color: "#F97316" },
              { label: "Severe", value: data.severe, color: "#EF4444" },
            ].map((s) => (
              <View key={s.label} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}>{s.label}</Text>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    {s.value} ({pct(s.value, data.total)}%)
                  </Text>
                </View>
                <Bar value={s.value} max={data.total} color={s.color} />
              </View>
            ))}
          </View>

          {/* ── Top violations ── */}
          {data.topViolations.length > 0 && (
            <>
              <SectionHeader label="TOP VIOLATION TYPES" />
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {data.topViolations.map((v, i) => (
                  <View key={v.name} style={{ marginBottom: i < data.topViolations.length - 1 ? 12 : 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", width: 16 }}>
                          {i + 1}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }} numberOfLines={1}>
                          {v.name}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E293B", marginLeft: 8 }}>
                        {v.count}
                      </Text>
                    </View>
                    <Bar value={v.count} max={maxVt} color="#6366F1" />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── By category ── */}
          {data.byCategory.length > 0 && (
            <>
              <SectionHeader label="BY CATEGORY" />
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {data.byCategory.map((c, i) => (
                  <View key={c.category} style={{ marginBottom: i < data.byCategory.length - 1 ? 12 : 0 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{c.category}</Text>
                      <Text style={{ fontSize: 12, color: "#64748B" }}>
                        {c.count} ({pct(c.count, data.total)}%)
                      </Text>
                    </View>
                    <Bar value={c.count} max={maxCat} color="#1D9E75" />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── Monthly trend ── */}
          {data.recentMonths.length > 1 && (
            <>
              <SectionHeader label="MONTHLY TREND" />
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 8,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {data.recentMonths.map((m, i) => (
                  <View key={m.month} style={{ marginBottom: i < data.recentMonths.length - 1 ? 10 : 0 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: "#64748B" }}>{m.month}</Text>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E293B" }}>{m.count}</Text>
                    </View>
                    <Bar value={m.count} max={maxMonth} color="#1E293B" />
                  </View>
                ))}
              </View>
            </>
          )}

          {data.total === 0 && (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Ionicons name="bar-chart-outline" size={52} color="#CBD5E1" />
              <Text style={{ color: "#94A3B8", marginTop: 12, fontSize: 14 }}>
                No violations in this period.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}