import { View, Text } from "react-native";

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#1a1a2e]">
      <View className="w-20 h-20 rounded-2xl bg-[#C8102E] items-center justify-center mb-5">
        <Text className="text-white text-2xl font-bold">NEU</Text>
      </View>
      <Text className="text-white text-xl font-bold">Violation Tracker</Text>
      <Text className="text-gray-400 text-sm mt-1">Login screen — Task #6 (wip)</Text>
    </View>
  );
}