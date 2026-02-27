import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useMedicines } from '../../lib/MedicineContext';

export default function Reports() {
  const { medicines } = useMedicines();

  const taken = medicines.filter(m => m.status === 'taken').length;
  const total = medicines.length;
  const compliance = total > 0 ? Math.round((taken / total) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>This Week</Text>
      
      <View style={styles.mainCard}>
        <Text style={styles.mainNumber}>{taken}/{total}</Text>
        <Text style={styles.mainLabel}>Doses Completed</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${compliance}%` }]} />
        </View>
        <Text style={styles.compliance}>{compliance}% Compliance</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statBig}>12</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statBig}>5</Text>
          <Text style={styles.statLabel}>Missed</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 30 },
  mainCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  mainNumber: { fontSize: 52, fontWeight: '800', color: '#10B981' },
  mainLabel: { fontSize: 18, color: '#64748B', marginTop: 8 },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginVertical: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  compliance: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  statBig: { fontSize: 36, fontWeight: '800', color: '#2196F3' },
  statLabel: { fontSize: 16, color: '#64748B', marginTop: 8 },
});
