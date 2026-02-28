import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMedicines } from '../../lib/MedicineContext';

export default function Reminders() {
  const { reminders, markTaken, deleteMedicine } = useMedicines();

  const renderReminder = ({ item }: { item: any }) => (
    <View style={styles.card}>
      
      {/* Top Row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.time}>{item.time}</Text>
          <Text style={styles.medicine}>{item.name}</Text>
        </View>

        <TouchableOpacity 
          style={styles.checkBtn}
          onPress={() => markTaken(item.id)}
        >
          <Ionicons name="checkmark-circle" size={30} color="#22C55E" />
        </TouchableOpacity>
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.taken ? '#DCFCE7' : '#FEF3C7' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.taken ? '#15803D' : '#B45309' }
          ]}>
            {item.taken ? 'Taken' : 'Pending'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => deleteMedicine(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

    </View>
  );

  if (reminders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={90} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>No Reminders</Text>
        <Text style={styles.emptyText}>Start by adding your medicines 💊</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {reminders.length} Reminder{reminders.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminder}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bottomRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  time: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },

  medicine: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 6,
  },

  checkBtn: {
    padding: 6,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  deleteBtn: {
    padding: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 20,
  },

  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
});