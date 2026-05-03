// ─── DatePickerModal ─────────────────────────────────────────────────────────
// Drop this above SectionLabel in record.tsx
// Usage: <DatePickerModal value={date} onChange={setDate} onClose={() => setShowDatePicker(false)} visible={showDatePicker} />
// `value` and onChange use "YYYY-MM-DD" strings

import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ITEM_H = 44;

function Drum({
  items,
  selected,
  onSelect,
}: {
  items: (string | number)[];
  selected: number; // index
  onSelect: (i: number) => void;
}) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    ref.current?.scrollTo({ y: selected * ITEM_H, animated: false });
  }, []);

  return (
    <View style={{ flex: 1, height: ITEM_H * 5, overflow: "hidden" }}>
      {/* selection highlight */}
      <View style={{ position: "absolute", top: ITEM_H * 2, left: 4, right: 4, height: ITEM_H, backgroundColor: "#F1F5F9", borderRadius: 8, zIndex: 0 }} />
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

export function DatePickerModal({
  visible,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const now = new Date();
  const parsed = value ? new Date(value + "T00:00:00") : now;

  const [monthIdx, setMonthIdx] = useState(parsed.getMonth());
  const [day, setDay]           = useState(parsed.getDate() - 1); // 0-indexed
  const [yearIdx, setYearIdx]   = useState(0);

  const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() - 9 + i).filter(y => y <= now.getFullYear());
  const days  = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    if (visible) {
      const d = value ? new Date(value + "T00:00:00") : now;
      setMonthIdx(d.getMonth());
      setDay(d.getDate() - 1);
      setYearIdx(years.indexOf(d.getFullYear()));
    }
  }, [visible]);

  const handleDone = () => {
    const y = years[yearIdx];
    const m = monthIdx + 1;
    const d = day + 1;
    const padded = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onChange(padded);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} activeOpacity={1} onPress={onClose} />
      <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, position: "absolute", bottom: 0, left: 0, right: 0 }}>
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

        {/* Drums */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
          <Drum items={MONTHS} selected={monthIdx} onSelect={setMonthIdx} />
          <Drum items={days} selected={day} onSelect={setDay} />
          <Drum items={years} selected={yearIdx === -1 ? years.length - 1 : yearIdx} onSelect={setYearIdx} />
        </View>
      </View>
    </Modal>
  );
}

// ─── TimePickerModal ──────────────────────────────────────────────────────────
// Usage: <TimePickerModal value={time} onChange={setTime} onClose={() => setShowTimePicker(false)} visible={showTimePicker} />
// `value` and onChange use "HH:MM:SS" strings

export function TimePickerModal({
  visible,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  value: string; // HH:MM:SS
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const parseTime = (hms: string) => {
    const [h, m] = (hms || "08:00:00").split(":").map(Number);
    const isPM = h >= 12;
    const hour12 = h % 12 || 12;
    return { hourIdx: hour12 - 1, minIdx: m, period: isPM ? 1 : 0 };
  };

  const [hourIdx, setHourIdx]   = useState(parseTime(value).hourIdx);
  const [minIdx, setMinIdx]     = useState(parseTime(value).minIdx);
  const [period, setPeriod]     = useState(parseTime(value).period);

  useEffect(() => {
    if (visible) {
      const p = parseTime(value);
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
    const hms = `${String(h).padStart(2, "0")}:${String(minIdx).padStart(2, "0")}:00`;
    onChange(hms);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} activeOpacity={1} onPress={onClose} />
      <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, position: "absolute", bottom: 0, left: 0, right: 0 }}>
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

        {/* Drums */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
          <Drum items={hours} selected={hourIdx} onSelect={setHourIdx} />
          <Drum items={minutes} selected={minIdx} onSelect={setMinIdx} />
          <Drum
            items={["AM", "PM"]}
            selected={period}
            onSelect={setPeriod}
          />
        </View>
      </View>
    </Modal>
  );
}