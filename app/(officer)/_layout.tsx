import { Tabs } from 'expo-router';

export default function OfficerLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="history" options={{ title: 'Violations' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="sanctions" options={{ title: 'Sanctions' }} />
    </Tabs>
  );
}