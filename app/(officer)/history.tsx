import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ViolationHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
      <Text style={{ color: "#94A3B8", fontSize: 14 }}>Violation History</Text>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(officer)/record")}
        style={{
          position: "absolute",
          bottom: 24 + insets.bottom,
          right: 20,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: "#1E293B",
          alignItems: "center", justifyContent: "center",
          shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 }, elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}