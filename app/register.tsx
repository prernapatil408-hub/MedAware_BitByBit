import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { COLORS } from '../utils/theme';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  height: string;
  weight: string;
  gender: string;
};

type Errors = Partial<Record<keyof FormData | 'general', string>>;

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '', password: '', confirmPassword: '',
    age: '', height: '', weight: '', gender: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) 
      newErrors.email = 'Valid email required';
    if (!formData.password || formData.password.length < 6)
      newErrors.password = 'Password must be 6+ characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.age || isNaN(parseInt(formData.age)) || parseInt(formData.age) < 1)
      newErrors.age = 'Valid age required';
    if (!formData.height || isNaN(parseInt(formData.height)))
      newErrors.height = 'Height (cm) required';
    if (!formData.weight || isNaN(parseInt(formData.weight)))
      newErrors.weight = 'Weight (kg) required';
    if (!formData.gender.trim())
      newErrors.gender = 'Gender required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log('🔥 REGISTER → http://=10.203.52.34:8080/register', {
        email: formData.email,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        gender: formData.gender
      });

      const response = await fetch('http://10.203.52.34:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          weight: parseInt(formData.weight),
          gender: formData.gender,
        })
      });

      const data = await response.json();  // ✅ Direct JSON
      console.log('✅ REGISTER STATUS:', response.status, 'DATA:', data);

      if (data.success) {
        await AsyncStorage.multiSet([
          ['isLoggedIn', 'true'],
          ['uid', data.uid?.toString() || '1'],
          ['email', formData.email]
        ]);
        Alert.alert('✅ Success', data.message || 'Account created!');
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Registration Failed', data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.log('💥 Register error:', error.message);
      Alert.alert('Network Error', `Registration failed: ${error.message}\n\nBackend: http://10.203.52.34:8080`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient style={styles.gradient}   colors={['#1E3A8A', '#2563EB', '#60A5FA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <View style = {styles.iconCircle}>
            <Ionicons name="person-add-outline" size={80} color="white" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MedReminder</Text>
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
              placeholder="Enter password (6+ chars)"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
            />

            <CustomInput
              label="Confirm Password"
              placeholder="Re-enter password"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
            />

            <View style={styles.row}>
              <View style={styles.halfContainer}>
                <CustomInput
                  label="Age"
                  placeholder="e.g. 30"
                  keyboardType="numeric"
                  value={formData.age}
                  onChangeText={(text) => updateField('age', text)}
                  error={errors.age}
                />
              </View>
              <View style={styles.halfContainer}>
                <CustomInput
                  label="Gender"
                  placeholder="Male/Female"
                  value={formData.gender}
                  onChangeText={(text) => updateField('gender', text)}
                  error={errors.gender}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfContainer}>
                <CustomInput
                  label="Height (cm)"
                  placeholder="e.g. 170"
                  keyboardType="numeric"
                  value={formData.height}
                  onChangeText={(text) => updateField('height', text)}
                  error={errors.height}
                />
              </View>
              <View style={styles.halfContainer}>
                <CustomInput
                  label="Weight (kg)"
                  placeholder="e.g. 70"
                  keyboardType="numeric"
                  value={formData.weight}
                  onChangeText={(text) => updateField('weight', text)}
                  error={errors.weight}
                />
              </View>
            </View>
            <View style={styles.divider} />

            <CustomButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
            />

            <TouchableOpacity onPress={() => router.push('/')} style={styles.link}>
              <Text style={styles.linkText}>Already have account? Login</Text>
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
    padding: 24 
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing : 1,
    color: 'white',  // ✅ Fixed from 'black'
    marginTop: 20,
  },
  divider: {
  height: 1,
  backgroundColor: '#E2E8F0',
  marginVertical: 20,
},
  iconCircle: {
  backgroundColor: 'white',
  width: 100,
  height: 100,
  borderRadius: 50,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.15,
  shadowRadius: 20,
  elevation: 8,
},
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 8,
  },
  halfContainer: {
    flex: 0.48,
  },
  link: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color:  '#2563EB',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing:0.3,
  },
});
