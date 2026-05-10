import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IconName)}
      size={22}
      color={focused ? "#F59E0B" : "#94A3B8"}
    />
  );
}

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E293B",
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#F59E0B",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="violations"
        options={{
          title: "Violations",
          tabBarIcon: ({ focused }) => <TabIcon name="document-text" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="appeals"
        options={{
          title: "Appeals",
          tabBarIcon: ({ focused }) => <TabIcon name="chatbubble-ellipses" focused={focused} />,
        }}
      />
    </Tabs>
  );
}