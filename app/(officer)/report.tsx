import { useAuth } from "@/src/lib/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
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
  rows: {
    date: string;
    student: string;
    violation: string;
    category: string;
    severity: string;
    status: string;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

const monthLabel = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

const rangeLabel = (range: "30" | "90" | "365") => {
  switch (range) {
    case "30":  return "Last 30 Days";
    case "90":  return "Last 90 Days";
    case "365": return "This Year";
  }
};

const today = () =>
  new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// ─── CSV Builder ──────────────────────────────────────────────────────────────

function buildCSV(data: ReportData, range: string): string {
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;

  const lines: string[] = [
    // Header
    ["Date", "Student", "Violation Type", "Category", "Severity", "Status"]
      .map(escape).join(","),
    // Rows
    ...data.rows.map((r) =>
      [r.date, r.student, r.violation, r.category, r.severity, r.status]
        .map(escape).join(",")
    ),
    "",
    // Summary
    ["SUMMARY", "", "", "", "", ""].map(escape).join(","),
    ["Total", String(data.total), "", "", "", ""].map(escape).join(","),
    ["Pending", String(data.pending), "", "", "", ""].map(escape).join(","),
    ["Resolved", String(data.resolved), "", "", "", ""].map(escape).join(","),
    ["Appealed", String(data.appealed), "", "", "", ""].map(escape).join(","),
    ["Minor", String(data.minor), "", "", "", ""].map(escape).join(","),
    ["Major", String(data.major), "", "", "", ""].map(escape).join(","),
    ["Severe", String(data.severe), "", "", "", ""].map(escape).join(","),
  ];

  return lines.join("\n");
}

// ─── PDF HTML Builder ─────────────────────────────────────────────────────────

function buildPDFHtml(data: ReportData, range: string): string {
  const barHtml = (value: number, max: number, color: string) => {
    const w = max === 0 ? 0 : Math.round((value / max) * 100);
    return `<div style="background:#F1F5F9;border-radius:4px;height:10px;width:100%;overflow:hidden;">
      <div style="width:${w}%;height:100%;background:${color};border-radius:4px;"></div>
    </div>`;
  };

  const maxVt  = Math.max(...data.topViolations.map((v) => v.count), 1);
  const maxCat = Math.max(...data.byCategory.map((c) => c.count), 1);
  const maxMo  = Math.max(...data.recentMonths.map((m) => m.count), 1);

  const topViolationsHtml = data.topViolations.map((v, i) => `
    <tr>
      <td style="padding:8px 4px;color:#94A3B8;font-size:11px;width:24px;">${i + 1}</td>
      <td style="padding:8px 4px;font-size:13px;color:#334155;">${v.name}</td>
      <td style="padding:8px 4px;font-size:13px;font-weight:700;color:#1E293B;text-align:right;">${v.count}</td>
      <td style="padding:8px 4px;width:140px;">${barHtml(v.count, maxVt, "#6366F1")}</td>
    </tr>`).join("");

  const categoryHtml = data.byCategory.map((c) => `
    <tr>
      <td style="padding:8px 4px;font-size:13px;color:#334155;">${c.category}</td>
      <td style="padding:8px 4px;font-size:13px;font-weight:700;color:#1E293B;text-align:right;">${c.count} (${pct(c.count, data.total)}%)</td>
      <td style="padding:8px 4px;width:140px;">${barHtml(c.count, maxCat, "#1D9E75")}</td>
    </tr>`).join("");

  const monthHtml = data.recentMonths.map((m) => `
    <tr>
      <td style="padding:8px 4px;font-size:13px;color:#64748B;">${m.month}</td>
      <td style="padding:8px 4px;font-size:13px;font-weight:700;color:#1E293B;text-align:right;">${m.count}</td>
      <td style="padding:8px 4px;width:140px;">${barHtml(m.count, maxMo, "#1E293B")}</td>
    </tr>`).join("");

  const rowsHtml = data.rows.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#F8FAFC"};">
      <td style="padding:7px 8px;font-size:11px;color:#64748B;">${r.date}</td>
      <td style="padding:7px 8px;font-size:11px;color:#1E293B;">${r.student}</td>
      <td style="padding:7px 8px;font-size:11px;color:#334155;">${r.violation}</td>
      <td style="padding:7px 8px;font-size:11px;color:#64748B;">${r.category}</td>
      <td style="padding:7px 8px;font-size:11px;">
        <span style="background:${r.severity === "Minor" ? "#FEF3C7" : r.severity === "Major" ? "#FEE9D9" : "#FEE2E2"};
          color:${r.severity === "Minor" ? "#92400E" : r.severity === "Major" ? "#9A3412" : "#991B1B"};
          border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;">${r.severity.toUpperCase()}</span>
      </td>
      <td style="padding:7px 8px;font-size:11px;">
        <span style="background:${r.status === "resolved" ? "#D1FAE5" : r.status === "pending" ? "#FEF3C7" : "#DBEAFE"};
          color:${r.status === "resolved" ? "#065F46" : r.status === "pending" ? "#92400E" : "#1E40AF"};
          border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;">${r.status.toUpperCase()}</span>
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1E293B; background: #fff; padding: 32px; }
    h1 { font-size: 24px; font-weight: 800; color: #1E293B; }
    h2 { font-size: 14px; font-weight: 700; color: #94A3B8; letter-spacing: 1px; margin: 24px 0 12px; text-transform: uppercase; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 2px solid #F1F5F9; padding-bottom: 20px; }
    .badge { background: #F59E0B; color: #fff; font-size: 11px; font-weight: 700; border-radius: 6px; padding: 4px 10px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 8px; }
    .stat-card { background: #F8FAFC; border-radius: 10px; padding: 14px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 800; color: #1E293B; }
    .stat-label { font-size: 10px; font-weight: 700; color: #94A3B8; margin-top: 4px; letter-spacing: 0.5px; }
    .severity-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .sev-card { border-radius: 10px; padding: 14px; text-align: center; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px; font-size: 11px; font-weight: 700; color: #94A3B8; background: #F8FAFC; letter-spacing: 0.5px; }
    .card { background: #F8FAFC; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
    .page-break { page-break-before: always; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #F1F5F9; font-size: 11px; color: #94A3B8; text-align: center; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <h1>EduGuard Violations Report</h1>
      <p style="color:#64748B;font-size:13px;margin-top:4px;">${rangeLabel(range as any)} &nbsp;·&nbsp; Generated ${today()}</p>
    </div>
    <span class="badge">${data.total} Total</span>
  </div>

  <!-- Summary -->
  <h2>Summary</h2>
  <div class="summary-grid">
    <div class="stat-card"><div class="stat-value">${data.total}</div><div class="stat-label">TOTAL</div></div>
    <div class="stat-card"><div class="stat-value" style="color:#92400E;">${data.pending}</div><div class="stat-label">PENDING</div></div>
    <div class="stat-card"><div class="stat-value" style="color:#065F46;">${data.resolved}</div><div class="stat-label">RESOLVED</div></div>
  </div>

  <!-- Severity -->
  <h2>By Severity</h2>
  <div class="severity-grid" style="margin-bottom:16px;">
    <div class="sev-card" style="background:#FEF3C7;"><div class="stat-value" style="font-size:22px;color:#92400E;">${data.minor}</div><div class="stat-label" style="color:#92400E;">MINOR (${pct(data.minor, data.total)}%)</div></div>
    <div class="sev-card" style="background:#FEE9D9;"><div class="stat-value" style="font-size:22px;color:#9A3412;">${data.major}</div><div class="stat-label" style="color:#9A3412;">MAJOR (${pct(data.major, data.total)}%)</div></div>
    <div class="sev-card" style="background:#FEE2E2;"><div class="stat-value" style="font-size:22px;color:#991B1B;">${data.severe}</div><div class="stat-label" style="color:#991B1B;">SEVERE (${pct(data.severe, data.total)}%)</div></div>
  </div>

  <!-- Top Violations -->
  ${data.topViolations.length > 0 ? `
  <h2>Top Violation Types</h2>
  <div class="card">
    <table><tbody>${topViolationsHtml}</tbody></table>
  </div>` : ""}

  <!-- By Category -->
  ${data.byCategory.length > 0 ? `
  <h2>By Category</h2>
  <div class="card">
    <table><tbody>${categoryHtml}</tbody></table>
  </div>` : ""}

  <!-- Monthly Trend -->
  ${data.recentMonths.length > 1 ? `
  <h2>Monthly Trend</h2>
  <div class="card">
    <table><tbody>${monthHtml}</tbody></table>
  </div>` : ""}

  <!-- All Records — new page -->
  ${data.rows.length > 0 ? `
  <div class="page-break"></div>
  <h2>All Records (${data.rows.length})</h2>
  <table>
    <thead>
      <tr>
        <th>DATE</th><th>STUDENT</th><th>VIOLATION</th>
        <th>CATEGORY</th><th>SEVERITY</th><th>STATUS</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>` : ""}

  <div class="footer">EduGuard · School Disciplinary Management · Confidential</div>
</body>
</html>`;
}

// ─── Export Handlers ──────────────────────────────────────────────────────────

async function exportPDF(data: ReportData, range: "30" | "90" | "365") {
  try {
    const html = buildPDFHtml(data, range);
    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const dest = FileSystem.documentDirectory +
      `EduGuard_Report_${range}d_${Date.now()}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: dest });

    await Sharing.shareAsync(dest, {
      mimeType: "application/pdf",
      dialogTitle: "Save or Share Report PDF",
      UTI: "com.adobe.pdf",
    });
  } catch (e: any) {
    Alert.alert("Export Failed", e.message ?? "Could not generate PDF.");
  }
}

async function exportCSV(data: ReportData, range: "30" | "90" | "365") {
  try {
    const csv = buildCSV(data, range);
    const path = FileSystem.documentDirectory +
      `EduGuard_Report_${range}d_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(path, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(path, {
      mimeType: "text/csv",
      dialogTitle: "Save or Share Report CSV",
      UTI: "public.comma-separated-values-text",
    });
  } catch (e: any) {
    Alert.alert("Export Failed", e.message ?? "Could not generate CSV.");
  }
}

function showExportSheet(
  data: ReportData,
  range: "30" | "90" | "365",
  setExporting: (v: boolean) => void,
) {
  const run = async (type: "pdf" | "csv") => {
    setExporting(true);
    if (type === "pdf") await exportPDF(data, range);
    else await exportCSV(data, range);
    setExporting(false);
  };

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Export as PDF", "Export as CSV"],
        cancelButtonIndex: 0,
      },
      (i) => {
        if (i === 1) run("pdf");
        if (i === 2) run("csv");
      },
    );
  } else {
    Alert.alert("Export Report", "Choose a format:", [
      { text: "Cancel", style: "cancel" },
      { text: "Export as PDF", onPress: () => run("pdf") },
      { text: "Export as CSV", onPress: () => run("csv") },
    ]);
  }
}

// ─── Bar ─────────────────────────────────────────────────────────────────────

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max === 0 ? 0 : (value / max) * 100;
  return (
    <View style={{ flex: 1, height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
      <View style={{ width: `${w}%`, height: "100%", backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 }}>
      {label}
    </Text>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Reports() {
  const insets   = useSafeAreaInsets();
  const { profile } = useAuth();
  const isAdmin  = profile?.role === "admin";

  const [data,       setData]       = useState<ReportData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [exporting,  setExporting]  = useState(false);
  const [range,      setRange]      = useState<"30" | "90" | "365">("30");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);

      const since = new Date();
      since.setDate(since.getDate() - parseInt(range));
      const sinceStr = since.toISOString().split("T")[0];

      const { data: rawRows, error } = await supabase
        .from("student_violations")
        .select(`
          id, severity, status, date_of_incident,
          student:profiles!student_id(full_name),
          violation_type:violation_type_id(name, category)
        `)
        .gte("date_of_incident", sinceStr)
        .order("date_of_incident", { ascending: false });

      if (error || !rawRows) { setLoading(false); return; }

      const total    = rawRows.length;
      const pending  = rawRows.filter((r) => r.status === "pending").length;
      const resolved = rawRows.filter((r) => r.status === "resolved").length;
      const appealed = rawRows.filter((r) => r.status === "appealed").length;
      const minor    = rawRows.filter((r) => r.severity === "Minor").length;
      const major    = rawRows.filter((r) => r.severity === "Major").length;
      const severe   = rawRows.filter((r) => r.severity === "Severe").length;

      const catMap: Record<string, number> = {};
      rawRows.forEach((r: any) => {
        const cat = r.violation_type?.category ?? "Other";
        catMap[cat] = (catMap[cat] ?? 0) + 1;
      });
      const byCategory = Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      const vtMap: Record<string, number> = {};
      rawRows.forEach((r: any) => {
        const name = r.violation_type?.name ?? "Unknown";
        vtMap[name] = (vtMap[name] ?? 0) + 1;
      });
      const topViolations = Object.entries(vtMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const monthMap: Record<string, number> = {};
      rawRows.forEach((r) => {
        const key = monthLabel(r.date_of_incident);
        monthMap[key] = (monthMap[key] ?? 0) + 1;
      });
      const recentMonths = Object.entries(monthMap)
        .map(([month, count]) => ({ month, count }))
        .slice(-6);

      // Flat rows for export
      const rows = (rawRows as any[]).map((r) => ({
        date:      new Date(r.date_of_incident).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        student:   r.student?.full_name ?? "Unknown",
        violation: r.violation_type?.name ?? "Unknown",
        category:  r.violation_type?.category ?? "Other",
        severity:  r.severity,
        status:    r.status,
      }));

      setData({ total, pending, resolved, appealed, minor, major, severe, byCategory, topViolations, recentMonths, rows });
      setLoading(false);
    };

    fetchReport();
  }, [range]);

  const maxMonth = data ? Math.max(...data.recentMonths.map((m) => m.count), 1) : 1;
  const maxCat   = data ? Math.max(...data.byCategory.map((c) => c.count), 1) : 1;
  const maxVt    = data ? Math.max(...data.topViolations.map((v) => v.count), 1) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>

      {/* Header */}
      <View style={{ backgroundColor: "#1E293B", paddingTop: insets.top + 8, paddingBottom: 20, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>Reports</Text>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => {
                if (!data || data.total === 0) {
                  Alert.alert("No Data", "There is no data to export for this period.");
                  return;
                }
                showExportSheet(data, range, setExporting);
              }}
              disabled={exporting || loading}
              style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: exporting ? "#475569" : "#F59E0B",
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
              }}
            >
              {exporting
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="download-outline" size={14} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Export</Text>
                  </>
              }
            </TouchableOpacity>
          )}
        </View>

        {/* Range selector */}
        <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 3 }}>
          {([["30", "Last 30d"], ["90", "Last 90d"], ["365", "This Year"]] as const).map(([val, label]) => (
            <TouchableOpacity
              key={val}
              onPress={() => setRange(val)}
              style={{ flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8, backgroundColor: range === val ? "#F59E0B" : "transparent" }}
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

          {/* Summary */}
          <SectionHeader label="SUMMARY" />
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            {[
              { label: "TOTAL",    value: data.total,    bg: "#1E293B", text: "#fff"    },
              { label: "PENDING",  value: data.pending,  bg: "#FEF3C7", text: "#92400E" },
              { label: "RESOLVED", value: data.resolved, bg: "#D1FAE5", text: "#065F46" },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: s.bg, borderRadius: 12, padding: 14, alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "800", color: s.text }}>{s.value}</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color: s.text, opacity: 0.7, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Severity */}
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B", marginBottom: 14 }}>By Severity</Text>
            {[
              { label: "Minor",  value: data.minor,  color: "#F59E0B" },
              { label: "Major",  value: data.major,  color: "#F97316" },
              { label: "Severe", value: data.severe, color: "#EF4444" },
            ].map((s) => (
              <View key={s.label} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}>{s.label}</Text>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>{s.value} ({pct(s.value, data.total)}%)</Text>
                </View>
                <Bar value={s.value} max={data.total} color={s.color} />
              </View>
            ))}
          </View>

          {/* Top violations */}
          {data.topViolations.length > 0 && (
            <>
              <SectionHeader label="TOP VIOLATION TYPES" />
              <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                {data.topViolations.map((v, i) => (
                  <View key={v.name} style={{ marginBottom: i < data.topViolations.length - 1 ? 12 : 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", width: 16 }}>{i + 1}</Text>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }} numberOfLines={1}>{v.name}</Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E293B", marginLeft: 8 }}>{v.count}</Text>
                    </View>
                    <Bar value={v.count} max={maxVt} color="#6366F1" />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* By category */}
          {data.byCategory.length > 0 && (
            <>
              <SectionHeader label="BY CATEGORY" />
              <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                {data.byCategory.map((c, i) => (
                  <View key={c.category} style={{ marginBottom: i < data.byCategory.length - 1 ? 12 : 0 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{c.category}</Text>
                      <Text style={{ fontSize: 12, color: "#64748B" }}>{c.count} ({pct(c.count, data.total)}%)</Text>
                    </View>
                    <Bar value={c.count} max={maxCat} color="#1D9E75" />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Monthly trend */}
          {data.recentMonths.length > 1 && (
            <>
              <SectionHeader label="MONTHLY TREND" />
              <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
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
              <Text style={{ color: "#94A3B8", marginTop: 12, fontSize: 14 }}>No violations in this period.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}