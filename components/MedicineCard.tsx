import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface Medicine {
  id: string;
  reminderId: string;
  name: string;
  time: string;
  dosage: string;
  totalDosage: string;
  image?: string;
}

interface MedicineCardProps {
  medicine: Medicine;
  onPress?: () => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onPress }) => {
  return (
    <View style={styles.card}>
      {medicine.image && (
        <Image source={{ uri: medicine.image }} style={styles.image} />
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.name}>{medicine.name}</Text>

          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={14} color="#2563EB" />
            <Text style={styles.timeText}>{medicine.time}</Text>
          </View>
        </View>

        {/* Dosage Info */}
        <View style={styles.infoRow}>
          <View style={styles.dosagePill}>
            <Text style={styles.dosageText}>{medicine.dosage}</Text>
          </View>

          <Text style={styles.totalText}>
            Total: {medicine.totalDosage}
          </Text>
        </View>

        {/* Action Button */}
        {onPress && (
          <Pressable onPress={onPress} style={styles.button}>
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              style={styles.gradient}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="white" />
              <Text style={styles.buttonText}>Take Medicine</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default MedicineCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },

  image: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    marginBottom: 14,
  },

  content: {},

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  timeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  dosagePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  dosageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },

  totalText: {
    fontSize: 13,
    color: '#64748B',
  },

  button: {
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },

  gradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },

  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
});