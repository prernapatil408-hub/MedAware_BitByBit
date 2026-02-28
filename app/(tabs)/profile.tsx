import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useFocusEffect } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import CustomButton from '../../components/CustomButton';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

 interface ProfileStatProps {
  icon: IoniconName;
  label: string;
  value: string;
  color: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    age: '',
    email: '',
    height: '',
    weight: '',
  });
 



  const [medicinesCount, setMedicinesCount] = useState(0);
  const [dosesTaken, setDosesTaken] = useState(0);
  const router = useRouter();

 useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      const user = await AsyncStorage.getItem('userData');
      const medicines = await AsyncStorage.getItem('medicines');
      const history = await AsyncStorage.getItem('history');

      if (user) setUserData(JSON.parse(user));
      
      // Calculate counts safely
      const medList = medicines ? JSON.parse(medicines) : [];
      const historyList = history ? JSON.parse(history) : [];

      setMedicinesCount(medList.length);
      setDosesTaken(historyList.filter((h: any) => h.status === 'taken').length);
    } catch (err) {
      console.error("Failed to load profile data", err);
    }
  };
 const handleLogout = async () => {
  try {
    await AsyncStorage.multiRemove(['uid', 'isLoggedIn', 'userToken', 'userData']);
    Alert.alert('Logged Out', 'Come back anytime!', [
      { text: 'OK', onPress: () => router.replace('/') } // force back to login
    ]);
  } catch (err) {
    console.log("Logout error:", err);
    Alert.alert('Error', 'Something went wrong while logging out.');
  }
};


  const ProfileStat = ({ icon, label, value, color }: ProfileStatProps) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={28} color={color} />
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#F5F7FA', '#E8F4FD']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
  colors={['#2196F3', '#42A5F5']}
  style={styles.premiumHeader}
>
  <View style={styles.avatarWrapper}>
    <Image
      source={{
        uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'
      }}
      style={styles.premiumAvatar}
    />
  </View>

  <Text style={styles.premiumName}>
    {userData.email?.split('@')[0] || 'User'}
  </Text>

  <Text style={styles.premiumEmail}>
    {userData.email || 'No email'}
  </Text>

  <View style={styles.activeBadge}>
    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
    <Text style={styles.activeText}>Active User</Text>
  </View>
</LinearGradient>
     
        {/* Stats */}
        <View style={styles.statsSection}>
          <ProfileStat 
            icon="medkit" 
            label="Active Medicines" 
            value={medicinesCount.toString()} 
            color="#2196F3" 
          />
          <ProfileStat 
            icon="checkmark-circle" 
            label="Doses Taken" 
            value={dosesTaken.toString()} 
            color="#4CAF50" 
          />
        </View>

        {/* User Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Health Info</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#666" />
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{userData.age || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="resize-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Height:</Text>
              <Text style={styles.infoValue}>{userData.height || 'N/A'} cm</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="barbell" size={20} color="#666" />
              <Text style={styles.infoLabel}>Weight:</Text>
              <Text style={styles.infoValue}>{userData.weight || 'N/A'} kg</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="settings-outline" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="help-circle-outline" size={24} color="#FF9800" />
            <Text style={styles.actionText}>Help & Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <CustomButton 
          title="Logout" 
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutBtn}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  premiumHeader: {
  paddingTop: 70,
  paddingBottom: 40,
  alignItems: 'center',
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
},

avatarWrapper: {
  padding: 4,
  borderRadius: 60,
  backgroundColor: 'rgba(255,255,255,0.3)',
},

premiumAvatar: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 4,
  borderColor: 'white',
},

premiumName: {
  fontSize: 26,
  fontWeight: 'bold',
  color: 'white',
  marginTop: 16,
},

premiumEmail: {
  fontSize: 15,
  color: 'rgba(255,255,255,0.9)',
  marginTop: 4,
},

activeBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'white',
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 20,
  marginTop: 14,
},

activeText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#4CAF50',
  marginLeft: 6,
},

  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 8,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  statContent: {
    marginLeft: 16,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'right',
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginLeft: 16,
  },
  logoutContainer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  logoutBtn: {
    marginTop: 0,
  },
});