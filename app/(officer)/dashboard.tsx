import { View, Text, StyleSheet } from "react-native";

export default function OfficerDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Officer Dashboard</Text>
      <Text style={styles.subtitle}>Task #3 — UI mockup pending (wip)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F7F8" },
  title: { color: "#1a1a2e", fontSize: 18, fontWeight: "bold" },
  subtitle: { color: "#6B7280", fontSize: 14, marginTop: 4 },
});