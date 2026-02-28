import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useMedicines } from '../../lib/MedicineContext';

export default function Reports() {
  const { medicines } = useMedicines();

  const taken = medicines.filter(m => m.status === 'taken').length;
  const missed = medicines.filter(m => m.status === 'missed').length;
  const active = medicines.filter(m => m.status === 'pending').length;

  const total = medicines.length;
  const compliance = total > 0 ? Math.round((taken / total) * 100) : 0;

  const progressColor =
    compliance >= 80
      ? '#10B981'
      : compliance >= 50
      ? '#F59E0B'
      : '#EF4444';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Weekly Report</Text>

      {/* Main Compliance Card */}
      <View style={styles.mainCard}>
        <Text style={[styles.mainNumber, { color: progressColor }]}>
          {taken}/{total}
        </Text>
        <Text style={styles.mainLabel}>Doses Completed</Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${compliance}%`, backgroundColor: progressColor },
            ]}
          />
        </View>

        <Text style={styles.compliance}>{compliance}% Compliance</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statBig, { color: '#3B82F6' }]}>{active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statBig, { color: '#EF4444' }]}>{missed}</Text>
          <Text style={styles.statLabel}>Missed</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 30,
  },

  mainCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 26,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },

  mainNumber: {
    fontSize: 56,
    fontWeight: '900',
  },

  mainLabel: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 8,
  },

  progressBar: {
    height: 10,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    marginVertical: 22,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  compliance: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 22,
    alignItems: 'center',
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 6,
  },

  statBig: {
    fontSize: 38,
    fontWeight: '900',
  },

  statLabel: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
});