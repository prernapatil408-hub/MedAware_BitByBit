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
import { socket } from '../lib/socket';

const { width } = Dimensions.get('window');
const CAMERA_SIZE = Math.min(width * 0.85, 360);

type Medicine = { id: string; name: string; reminderId?: string };

export default function CameraVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const medicineId = params.medicineId as string;

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [uid, setUid] = useState<number | null>(null);
  
  // 🔥 FIXED STATES
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);

  const frameCountRef = useRef(0);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCapturingRef = useRef(false);
  const isActiveRef = useRef(false);

  /** 🔥 TOTAL KILL SWITCH */
  const emergencyStop = useCallback(() => {
    console.log('🛑 EMERGENCY STOP ACTIVATED');
    
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (timeoutIntervalRef.current) {
      clearInterval(timeoutIntervalRef.current);
      timeoutIntervalRef.current = null;
    }
    
    isActiveRef.current = false;
    isCapturingRef.current = false;
    setIsVerifying(false);
    setShowOverlay(false);
    setOverlayImage(null);
    frameCountRef.current = 0;
  }, []);

  /** 🔥 CAMERA CAPTURE */
  const captureAndSend = async () => {
    if (!isActiveRef.current || isCapturingRef.current || !cameraRef.current) {
      return;
    }

    isCapturingRef.current = true;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        base64: true,
        skipProcessing: true,
        maxDimension: 400,
      });

      if (photo?.base64 && uid && medicine?.reminderId) {
        socket.emit("raw_frame", {
          uid: uid,
          rid: Number(medicine.reminderId),
          frame: photo.base64,
        });
        frameCountRef.current += 1;
        console.log(`📤 Frame #${frameCountRef.current}`);
      }
    } catch (err) {
      console.log("❌ Capture error - continuing...");
    } finally {
      isCapturingRef.current = false;
    }
  };

  /** 🔥 START CONTINUOUS */
  const startCapture = useCallback(() => {
    console.log('🚀 CONTINUOUS CAPTURE STARTED');
    isActiveRef.current = true;
    frameCountRef.current = 0;
    
    frameIntervalRef.current = setInterval(captureAndSend, 1000);
    captureAndSend();
  }, [uid, medicine]);

  /** 🔥 PERFECT SOCKET HANDLERS */
  useEffect(() => {
    const handleAnnotatedFrame = (data: any) => {
      console.log("📥 🔥 ANNOTATED FRAME ARRIVED!");
      console.log("Raw data:", typeof data, data?.substring?.(0, 50));
      
      try {
        let frameData: string;
        if (typeof data === 'string') {
          frameData = data;
        } else if (data?.frame) {
          frameData = data.frame;
        } else {
          console.log("❌ Bad frame format");
          return;
        }

        // 🔥 FIXED BASE64 CLEANING
        let cleanBase64 = frameData;
        if (frameData.includes('data:image')) {
          const match = frameData.match(/data:([A-Za-z-+\/]+);base64,(.+)/);
          if (match) cleanBase64 = match[2];
        } else if (frameData.includes(',')) {
          cleanBase64 = frameData.split(',')[1];
        }
        
        if (cleanBase64.length < 1000) {
          console.log("❌ Base64 too short");
          return;
        }
        
        const truncated = cleanBase64.substring(0, 900000);
        const imageUri = `data:image/jpeg;base64,${truncated}`;
        
        console.log("🖼️ 🔥 OVERLAY LOADED - Size:", imageUri.length);
        setOverlayImage(imageUri);
        setShowOverlay(true);
      } catch (e) {
        console.log("❌ Overlay processing failed:", e);
      }
    };

    const handleVerified = (data: any) => {
      console.log("🎉 🔥 AI VERIFIED!");
      setVerified(true);
      emergencyStop();
      Alert.alert('✅ Verified!', 'AI confirmed your medicine!');
      setTimeout(() => router.back(), 1000);
    };

    console.log("🔌 Socket listeners registered");
    socket.on('annotated_frame', handleAnnotatedFrame);
    socket.on('verified', handleVerified);

    return () => {
      socket.off('annotated_frame', handleAnnotatedFrame);
      socket.off('verified', handleVerified);
    };
  }, [emergencyStop, router]);

  const handleVerify = useCallback(() => {
    if (!medicine?.reminderId || !uid) {
      Alert.alert('Error', 'Missing data');
      return;
    }
    
    console.log(`🚀 Starting - UID:${uid} RID:${medicine.reminderId}`);
    setVerified(false);
    setIsVerifying(true);
    setShowOverlay(false);
    setOverlayImage(null);
    startCapture();
  }, [startCapture, medicine, uid]);

  const handleStop = useCallback(() => {
    emergencyStop();
    router.push('/');
  }, [emergencyStop]);

  // 🔥 FIXED: Load data
  useEffect(() => {
    AsyncStorage.getItem('uid').then(uidStr => {
      if (uidStr) setUid(Number(uidStr));
    });
  }, []);

  useEffect(() => {
    if (medicineId) {
      AsyncStorage.getItem('medicines').then(data => {
        if (data) {
          const medicines = JSON.parse(data);
          const found = medicines.find((m: any) => m.id === medicineId);
          if (found) setMedicine(found);
        }
      });
    }
  }, [medicineId]);

  useEffect(() => {
    if (permission !== null) setLoadingPermission(false);
  }, [permission]);

  if (loadingPermission || !medicine?.reminderId || !uid || !permission?.granted) {
    return (
      <Modal visible animationType="slide">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        <Text style={styles.title}>AI Verify {medicine.name}</Text>
        
        <Text style={styles.subtitle}>
          {socket.connected ? '🟢 LIVE' : '🔴 OFFLINE'} | 
          Frames: {frameCountRef.current} | 
          {isVerifying && '⏳ ACTIVE'}
          {showOverlay && ' 🖼️ OVERLAY'}
        </Text>

        {/* 🔥 PERFECT CAMERA STACK - ALL INSIDE container */}
        <View style={styles.cameraContainer}>
          {/* 1. LIVE CAMERA */}
          <CameraView 
            ref={cameraRef} 
            style={styles.camera} 
            facing="front"
          />
          
          {/* 2. DIM OVERLAY */}
          <View style={styles.dimOverlay} />
          
          {/* 3. ANNOTATED OVERLAY */}
          {showOverlay && overlayImage && (
            <View style={styles.annotatedOverlay}>
              <Image
                source={{ uri: overlayImage }}
                style={styles.annotatedImage}
                resizeMode="cover"
                blurRadius={0}
              />
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>🟢 AI DETECTED</Text>
              </View>
            </View>
          )}
          
          {/* 4. FOCUS RING - TOPMOST */}
          <View style={styles.focusRing} />
        </View>

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
            <Text style={styles.verifyText}>✅ VERIFIED!</Text>
          ) : (
            <Text style={styles.verifyText}>🔍 Start Detection</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleStop}>
          <Text style={styles.cancelText}>❌ Stop</Text>
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
  loadingText: { marginTop: 10, color: '#444', fontSize: 16 },
  title: { fontSize: 26, color: 'white', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#ccc', marginBottom: 20, textAlign: 'center', fontSize: 16 },
  
  cameraContainer: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#10B981',
    position: 'relative',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    zIndex: 1,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 5,
  },
  annotatedOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  annotatedImage: {
    width: '100%',
    height: '100%',
    opacity: 0.75,
    borderRadius: 24,
  },
  aiBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  aiBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  focusRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#10B981',
    borderRadius: 24,
    zIndex: 15,
  },
  verifyBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
    marginBottom: 15,
  },
  verifiedBtn: { backgroundColor: '#059669' },
  verifyText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  disabled: { backgroundColor: '#6B7280' },
  cancelBtn: { marginTop: 10 },
  cancelText: { color: '#F44336', fontWeight: '600', fontSize: 16 },
});
