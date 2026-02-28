import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { View, ActivityIndicator, Text } from 'react-native';
import { MedicineProvider } from '../lib/MedicineContext';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔥 AUTH CHECK
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('isLoggedIn');
      const loggedIn = token === 'true';
      setIsLoggedIn(loggedIn);

      const inTabsGroup = segments[0] === '(tabs)';
      
      if (loggedIn && !inTabsGroup) {
        router.replace('/(tabs)/home');
      } else if (!loggedIn && inTabsGroup) {
        router.replace('/');
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 NOTIFICATION HANDLER
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  // 🔥 NOTIFICATION → CAMERA (EXPO ROUTER WAY)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { medicineId , reminderId } = response.notification.request.content.data as any;
       console.log('🔔 Notification Tapped with Data:', { medicineId, reminderId });
        
          // ✅ FIXED: Expo Router navigation
          router.push({
            pathname: '/camera',
            params: { 
                medicineId : medicineId,
                reminderId : reminderId
             }
          });
        }
      
    );

    return () => subscription.remove();
  }, [router]);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#F8FAFC' 
      }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B' }}>
          Loading Medaware...
        </Text>
      </View>
    );
  }

  return (
    <MedicineProvider>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' }
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="add-medicine" />
        <Stack.Screen name="index" />
      </Stack>
    </MedicineProvider>
  );
}
