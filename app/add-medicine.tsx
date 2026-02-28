import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import NotificationService from '../lib/NotificationService';

type MedicineFormData = {
  name: string;
  dosage: string;
  totalDosage: string;
  time: Date;
};

export default function AddMedicine() {
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    dosage: '',
    totalDosage: '',
    time: new Date(),
  });
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
   const [uid, setUid] = useState<number | null>(null);
   const [mid,setMid] = useState<number | null>(null);
   const [rid,setrid] = useState<number | null>(null);

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
  

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Medicine name required');
      return false;
    }
    if (!formData.dosage || isNaN(parseInt(formData.dosage))) {
      Alert.alert('Error', 'Valid dosage required');
      return false;
    }
    if (!formData.totalDosage || isNaN(parseInt(formData.totalDosage))) {
      Alert.alert('Error', 'Valid total dosage required');
      return false;
    }
    return true;
  };

 const handleAddMedicine = async () => {
  if(!uid){
    Alert.alert("Error","User ID not found.Please log in again");
    return;
   }
  if (!validateForm()) return;

  try {
    setLoading(true);
    
    // STEP 1: LOGIN CHECK - Get uid from session
    const uidResponse = await fetch('http://172.18.110.151:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // Required for session
      body: JSON.stringify({
        email: 'vivek.1251071058@vit.edu',  // Your test user
        password: '987654321'
      }),
    });
   
    // STEP 2: CREATE REMINDER → Get rid
    console.log('📅 STEP 1: Creating reminder...');
    const reminderResponse = await fetch('http://172.18.110.151:8080/add_reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // Session cookie
      body: JSON.stringify({
        rtime: formData.time.toTimeString().split(' ')[0],
        uid: Number(uid)
      }),
    });

    const reminderData = await reminderResponse.json();
    console.log('--- BACKEND DEBUG ---');
    console.log('Keys received from server:', Object.keys(reminderData));
    console.log('Full Data:', JSON.stringify(reminderData));
    const newRid = reminderData.rid || reminderData.id || reminderData.reminder_id;
    console.log('✅ Corrected RID:', newRid);
    if(!newRid){
      throw new Error(`Server response missing ID. Received: ${JSON.stringify(reminderData)}`);
    }
     setrid(newRid);
    // STEP 3: ADD MEDICINE → Get mid  
    console.log('💊 STEP 2: Adding medicine...');
    const medicineResponse = await fetch('http://172.18.110.151:8080/add_medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        uid: Number(uid),
        rid: newRid,
        mname: formData.name.trim(),
        dose_qty: parseInt(formData.dosage),
        total_qty: parseInt(formData.totalDosage),
      }),
    });


    const medicineData = await medicineResponse.json();
    console.log("DEBUG: Received from Python:", medicineData);
    const newMid = medicineData.mid;
    if (newMid === undefined) {
    throw new Error("Medicine ID not found in server response. Check Python logs.");
}
   setMid(newMid);
    Alert.alert('✅ Success', `Medicine "${formData.name}" added!\nReminder ID: ${newRid}\nMedicine ID: ${newMid}`);
    

    // STEP 4: Store mid locally for camera verification
    const newMedicine = {
      id: newMid.toString(),  // Use real backend ID
      reminderId: newRid.toString(),  // For camera verification
      uid: '123',  // Store uid after real login
      name: formData.name.trim(),
      dosage: formData.dosage,
      totalDosage: formData.totalDosage,
      time: formData.time.toISOString(),
    };
   
    // Save locally + schedule notification
    const existingData = await AsyncStorage.getItem('medicines');
    const medicines = existingData ? JSON.parse(existingData) : [];
    medicines.push(newMedicine);
    await AsyncStorage.setItem('medicines', JSON.stringify(medicines));
    await NotificationService.scheduleReminder(newMedicine);

  Alert.alert('✅ Success', `Medicine added!\nReminder ID: ${newRid}`);
    router.back();

  } catch (error: any) {
    console.error('💥 Detailed Backend Error:',{
      message : error.message,
      stack : error.stack,
    })
    Alert.alert('❌ Backend Error', `Reason:${error.message}`);
    // Fallback local save...
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>Add Medicine Reminder 💊</Text>
      
      <Text style={styles.note}>📱 Works offline too!</Text>

      <CustomInput
        label="Medicine Name *"
        placeholder="Paracetamol, Insulin, etc."
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <CustomInput
        label="Dosage *"
        placeholder="1"
        keyboardType="numeric"
        value={formData.dosage}
        onChangeText={(text) => setFormData({ ...formData, dosage: text })}
      />

      <CustomInput
        label="Total Dosage *"
        placeholder="30"
        keyboardType="numeric"
        value={formData.totalDosage}
        onChangeText={(text) => setFormData({ ...formData, totalDosage: text })}
      />

      <TouchableOpacity 
        style={styles.timeButton} 
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.timeText}>
          ⏰ Time: {formData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={formData.time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) setFormData({ ...formData, time: date });
          }}
        />
      )}

      <CustomButton
        title="💊 Save Reminder"
        onPress={handleAddMedicine}
        loading={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E293B',
    textAlign: 'center',
  },
  note: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  timeButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'center',
  },
});
