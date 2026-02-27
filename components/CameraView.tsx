import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationService from '../lib/NotificationService';
import { socket } from '../lib/socket';

const { width } = Dimensions.get('window');
const CAMERA_SIZE = Math.min(width * 0.85, 360);

type Medicine = { id: string; name: string; reminderId?: string };
interface CameraProps {
  routeMedicineId?: string;
  routeReminderId?: string;
}

export default function CameraVerification({
  routeMedicineId,
  routeReminderId
}:CameraProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const medicineId = params.medicineId as string;
  const reminderId = (params.reminderId || params.rid) as string;
  
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isVerifying, setIsVerifying] = useState(false);
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [verified, setVerified] = useState(false);
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [uid, setUid] = useState<number | null>(null);

  // 🔍 DEBUG LOGS
  useEffect(() => {
    console.log('🎥 === FRONT CAMERA LOADED ===');
    console.log('📱 medicineId:', medicineId);
    console.log('🔔 reminderId:', medicine?.reminderId);
    console.log('🔌 Socket status:', socket.connected ? '🟢 LIVE' : '🔴 OFFLINE');
  }, [medicineId, medicine?.reminderId]);

  // Load uid from AsyncStorage
  useEffect(() => {
    const loadUid = async () => {
      try {
        const uidStr = await AsyncStorage.getItem('uid');
        if (uidStr) {
          setUid(Number(uidStr));
          console.log('👤 UID loaded:', uidStr);
        }
      } catch (error) {
        console.log('❌ UID load error:', error);
      }
    };
    loadUid();
  }, []);

  // Load medicine from local storage
  useEffect(() => {
    const loadMedicine = async () => {
      if (!medicineId) {
        console.log('⚠️ NO medicineId');
        return;
      }
      try {
        const data = await AsyncStorage.getItem('medicines');
        const medicines = data ? JSON.parse(data) : [];
        const found = medicines.find((m: any) => m.id === medicineId);
        setMedicine(found || null);
        console.log('💊 Medicine found:', found?.name || 'NONE');
      } catch (error) {
        console.log('❌ Medicine load error:', error);
      }
    };
    loadMedicine();
  }, [medicineId]);

  // Permission status
  useEffect(() => {
    if (permission !== null) {
      setLoadingPermission(false);
      console.log('📷 Permission:', permission.granted ? '✅ GRANTED' : '❌ DENIED');
    }
  }, [permission]);

  // 🔥 SOCKET LISTENERS - Backend AI responses
  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ BACKEND SOCKET CONNECTED');
    };

    const handleDisconnect = () => {
      console.log('❌ SOCKET DISCONNECTED');
    };

   const handleAnnotatedFrame = (data: ArrayBuffer) => {
  const bytes = new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  const base64String = btoa(binary);
  setProcessedFrame(`data:image/jpeg;base64,${base64String}`);
};

    const handleVerified = async () => {
      console.log('🎉 AI VERIFICATION SUCCESS!');
      if (verified) return;
      
      setVerified(true);
      setIsVerifying(false);
      
      try {
        if (medicineId) {
          await NotificationService.stopAlarm();
          await NotificationService.addToHistory(medicineId, 'taken');
          console.log('📝 History updated');
        }
        Alert.alert('✅ Verified!', 'AI confirmed your medicine dose!');
        setTimeout(() => router.back(), 1500);
      } catch (error) {
        console.log('⚠️ Cleanup error:', error);
        router.back();
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('annotated_frame', handleAnnotatedFrame);
    socket.on('verified', handleVerified);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('annotated_frame', handleAnnotatedFrame);
      socket.off('verified', handleVerified);
    };
  }, [verified, medicineId, router]);

  // 🔥 FRAME CAPTURE → BACKEND AI (Continuous) - FIXED
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isVerifying && cameraRef.current && !verified && socket.connected && uid && medicine?.reminderId) {
      console.log('🚀 STARTING AI VERIFICATION - uid:', uid, 'rid:', medicine?.reminderId);
      interval = setInterval(async () => {
        try {
          const photo = await cameraRef.current!.takePictureAsync({
            quality: 0.6,
            base64: true,
            skipProcessing: true,
          });
          
          // Convert base64 → binary bytes (Backend expects bytes)
          const base64Data = photo.base64!;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);

          socket.emit('raw_frame', {
            uid: uid,
            rid: Number(medicine?.reminderId),
            frame: byteArray,
          });
          console.log('📤 Frame sent:', { uid, rid: medicine?.reminderId });
        } catch (error) {
          console.log('❌ Frame capture failed:', error);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVerifying, verified, uid, medicine?.reminderId]);

  // 🔥 TEST BUTTON - Single frame + socket test - FIXED
  const testCameraSocket = useCallback(async () => {
    console.log('🧪 === SINGLE FRAME + SOCKET TEST ===');
    
   // EARLY RETURNS - MODIFIED FOR BETTER DEBUGGING
  if (!uid) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Connecting to profile...</Text>
      </View>
    );
  }

  // If reminderId is missing, don't just show a spinner. Show an error with a button.
  if (!medicine?.reminderId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ Reminder ID Missing</Text>
        <Text style={styles.subtitle}>Check logs: {JSON.stringify(params)}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>← Go Back & Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
    
    if (!cameraRef.current) {
      console.log('❌ NO CAMERA REFERENCE');
      Alert.alert('Error', 'Camera not ready');
      return;
    }
    
    if (!socket.connected) {
      console.log('❌ SOCKET NOT CONNECTED');
      Alert.alert('Socket Offline', 'Backend not connected\nCheck lib/socket.ts IP');
      return;
    }
    
    try {
      console.log('📸 1. CAPTURING SINGLE FRAME...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
        base64: true,
        skipProcessing: true,
      });
      
      console.log('✅ 2. FRAME CAPTURED OK:', photo.base64?.substring(0, 30) + '...');
      
      // Convert base64 → binary bytes
      const base64Data = photo.base64!;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      console.log('🔌 3. SENDING TO BACKEND...');
      const ridValue = Number(medicine?.reminderId);

      if (isNaN(ridValue)) {
      console.log("⚠️ Invalid RID, skipping frame");
      return;
}
      socket.emit('raw_frame', {
        uid: uid,
        rid: Number(medicine?.reminderId),
        frame: byteArray,
      });
      
      console.log('📤 4. SOCKET EMIT SENT!');
      Alert.alert('✅ Test Success', `Frame sent!\nUID:${uid} RID:${medicine?.reminderId}`);
    } catch (error) {
      console.log('❌ 5. TEST FAILED:', error);
      Alert.alert('Test Failed', 'Camera capture error');
    }
  }, [uid, medicine?.reminderId]);

  const handleVerify = useCallback(() => {
    if (!medicine || !uid || !medicine?.reminderId) {
      Alert.alert('Error', 'Missing data - login again');
      return;
    }
    console.log('🚀 STARTING CONTINUOUS AI VERIFICATION');
    setIsVerifying(true);
    setProcessedFrame(null);
  }, [medicine, uid, medicine?.reminderId]);

  // EARLY RETURNS
  if (!medicine?.reminderId || !uid) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>
          Loading {uid ? '' : 'user'} {medicine?.reminderId ? '' : 'reminder'}...
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!medicineId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No medicine selected</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!medicine) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading medicine...</Text>
      </View>
    );
  }

  if (loadingPermission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading FRONT camera...</Text>
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <Modal visible animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>FRONT Camera Permission</Text>
          <Text style={styles.permissionText}>Allow camera for AI medicine verification</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={requestPermission}>
            <Text style={styles.retryText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // MAIN CAMERA UI
  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        {/* HEADER */}
        <Text style={styles.title}>AI Verify {medicine.name}</Text>
        <Text style={styles.subtitle}>
          Status: {socket.connected ? '🟢 LIVE' : '🔴 OFFLINE'}
          {' | UID:'}{uid}{' | RID:'}{medicine?.reminderId}
        </Text>

        {/* FRONT CAMERA */}
        <View style={styles.cameraContainer}>
          {processedFrame ? (
            <Image
              source={{ uri: processedFrame }}
              style={styles.camera}
              resizeMode="contain"
            />
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            />
          )}
          <View style={styles.overlay} />
          <View style={styles.focusRing} />
        </View>

        {/* 🔥 DEBUG TEST BUTTON */}
        <TouchableOpacity
          style={styles.testBtn}
          onPress={testCameraSocket}
          disabled={isVerifying}
        >
          <Text style={styles.testBtnText}>🧪 TEST FRAME → BACKEND</Text>
        </TouchableOpacity>

        {/* MAIN VERIFY BUTTON */}
        <TouchableOpacity
          style={[
            styles.verifyBtn,
            isVerifying && styles.disabled,
            verified && styles.verifiedBtn
          ]}
          onPress={handleVerify}
          disabled={isVerifying || verified}
        >
          {isVerifying ? (
            <ActivityIndicator color="white" />
          ) : verified ? (
            <Text style={styles.verifyText}>✅ AI VERIFIED!</Text>
          ) : (
            <Text style={styles.verifyText}>🔍 Start AI Verification</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          disabled={isVerifying}
        >
          <Text style={styles.cancelText}>❌ Skip</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    color: '#444',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8FAFC',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E293B',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  retryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 26,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  cameraContainer: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#10B981',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  focusRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 24,
  },
  testBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
    marginBottom: 15,
    width: '85%',
    alignItems: 'center',
  },
  testBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  verifyBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
    marginBottom: 15,
  },
  verifiedBtn: {
    backgroundColor: '#059669',
  },
  verifyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  disabled: {
    backgroundColor: '#6B7280',
  },
  cancelBtn: {
    marginTop: 10,
  },
  cancelText: {
    color: '#F44336',
    fontWeight: '600',
    fontSize: 16,
  },
});
