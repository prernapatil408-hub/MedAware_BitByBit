// app/camera.tsx (NEW lowercase file)
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import CameraVerification from '../components/CameraView';

export default function CameraScreen() {
  const params = useLocalSearchParams();
  const { medicineId, reminderId } = params;
  console.log('📱 CameraScreen forwarding params:', { medicineId, reminderId });
  
  return <CameraVerification 
      routeMedicineId={medicineId as string} 
      routeReminderId={reminderId as string}
  
  />;
}
