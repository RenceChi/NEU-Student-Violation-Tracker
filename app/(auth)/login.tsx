import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      setLoading(false);
      return;
    }

    // Fetch role and navigate immediately
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'student') {
      router.replace('/(student)');
    } else {
      router.replace('/(officer)');
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 24 }}>

          {/* Header */}
          <View style={{ alignItems: 'center', paddingTop: 80, paddingBottom: 40 }}>
            <View style={{
              width: 80, height: 80, backgroundColor: '#ddd',
              marginBottom: 16, justifyContent: 'center', alignItems: 'center'
            }}>
              <Ionicons name="school-outline" size={40} color="#999" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', textAlign: 'center', letterSpacing: 1 }}>
              STUDENT VIOLATION{'\n'}SYSTEM
            </Text>
            <Text style={{ fontSize: 12, color: '#666', letterSpacing: 2, marginTop: 4 }}>
              SCHOOL DISCIPLINARY MANAGEMENT
            </Text>
          </View>

          {/* Form */}
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 24 }}>Sign In</Text>

            {/* Username / ID */}
            <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1, color: '#666', marginBottom: 6 }}>
              USERNAME OR ID NUMBER
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 1, borderColor: '#ddd', borderRadius: 4,
              paddingHorizontal: 12, marginBottom: 16
            }}>
              <Feather name="user" size={16} color="#999" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Enter identification"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                style={{ flex: 1, paddingVertical: 14, fontSize: 15 }}
              />
            </View>

            {/* Password */}
            <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1, color: '#666', marginBottom: 6 }}>
              PASSWORD
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 1, borderColor: '#ddd', borderRadius: 4,
              paddingHorizontal: 12, marginBottom: 8
            }}>
              <Feather name="lock" size={16} color="#999" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{ flex: 1, paddingVertical: 14, fontSize: 15 }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>FORGOT PASSWORD?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: '#000', borderRadius: 4,
                paddingVertical: 16, alignItems: 'center', marginBottom: 24
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 2 }}>LOGIN</Text>
              }
            </TouchableOpacity>

            {/* OR CONTINUE AS */}
            <Text style={{ textAlign: 'center', color: '#999', marginBottom: 16, fontSize: 13 }}>
              OR CONTINUE AS
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={{
                flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4,
                paddingVertical: 16, alignItems: 'center'
              }}>
                <Ionicons name="people-outline" size={24} color="#333" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                  STUDENT /{'\n'}PARENT
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4,
                paddingVertical: 16, alignItems: 'center'
              }}>
                <Ionicons name="card-outline" size={24} color="#333" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: '600' }}>STAFF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={{ textAlign: 'center', color: '#999', fontSize: 12, padding: 24 }}>
            Having trouble? Contact your{'\n'}
            <Text style={{ fontWeight: '700', color: '#666' }}>system administrator</Text>
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}