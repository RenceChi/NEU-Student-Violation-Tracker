import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function OfficerDashboard() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Officer Dashboard</Text>
      <TouchableOpacity
        onPress={handleLogout}
        style={{ marginTop: 20, backgroundColor: '#000', padding: 12, borderRadius: 4 }}
      >
        <Text style={{ color: '#fff' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}