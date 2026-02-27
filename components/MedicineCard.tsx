import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export interface Medicine {
  id: string;
  reminderId : string,
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
      {medicine.image && <Image source={{ uri: medicine.image }} style={styles.image} />}
      <View style={styles.content}>
        <Text style={styles.name}>{medicine.name}</Text>
        <Text style={styles.text}>Dosage: {medicine.dosage}</Text>
        <Text style={styles.text}>Time: {medicine.time}</Text>
        <Text style={styles.text}>Total: {medicine.totalDosage}</Text>

        {onPress && (
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>Take Medicine</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MedicineCard;

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginVertical: 8, elevation: 4 },
  image: { width: '100%', height: 120, borderRadius: 10, marginBottom: 10 },
  content: {},
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  text: { fontSize: 14, marginBottom: 4, color: '#555' },
  button: { marginTop: 10, backgroundColor: '#4f46e5', padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});