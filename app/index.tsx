import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, Alert, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../utils/theme';
import NotificationService from '../lib/NotificationService';

type LoginData = { 
  email: string; 
  password: string; 
};

type LoginErrors = Partial<Record<keyof LoginData | 'general', string>>;

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { NotificationService.initialize(); }, []);
  
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        if (loggedIn === 'true') router.replace('/(tabs)/home');
      } catch (err) { console.log('Login check error:', err); }
    };
    checkLoginStatus();
  }, []);

  const updateField = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: LoginErrors = {};
    if (!formData.email) newErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log('🔥 LOGIN → http://192.168.0.114:8080/login', formData);
      
      const response = await fetch('http://192.168.0.114:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // ✅ Backend session
        body: JSON.stringify(formData)
      });

      const data = await response.json();  // ✅ Direct JSON - Backend fixed
      console.log('✅ STATUS:', response.status, 'DATA:', data);

      if (data.success) {
        // ✅ Backend returns uid + success
        await AsyncStorage.multiSet([
          ['isLoggedIn', 'true'],
          ['uid', data.uid?.toString() || '1'],
          ['email', formData.email]
        ]);
        Alert.alert('✅ Success', data.message || 'Logged in successfully!');
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error: any) {
      console.log('💥 Error:', error.message);
      Alert.alert('Network Error', `Login failed: ${error.message}\n\nBackend: http://192.168.0.114:8080`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#2563EB', '#3B82F6', '#1E40AF']} style={styles.gradient}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Ionicons name="medkit-outline" size={80} color="white" />
            <Text style={styles.title}>MedReminder</Text>
            <Text style={styles.subtitle}>Welcome Back</Text>
          </View>

          <View style={styles.formContainer}>
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              error={errors.email}
            />
            
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
            />
            
            <CustomButton 
              title="Login" 
              onPress={handleLogin} 
              loading={loading} 
            />
            
            <TouchableOpacity 
              onPress={() => router.push('/register')} 
              style={styles.link}
            >
              <Text style={styles.linkText}>Don't have account? Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 24 
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  link: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: COLORS.primary || '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
});
