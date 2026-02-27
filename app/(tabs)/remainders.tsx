import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMedicines } from '../../lib/MedicineContext';

export default function Reminders() {
  const { reminders, markTaken, deleteMedicine } = useMedicines();

  const renderReminder = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.time}>{item.time}</Text>
          <Text style={styles.medicine}>{item.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.markBtn}
          onPress={() => markTaken(item.id)}
        >
          <Ionicons name="checkmark-circle" size={28} color="#10B981" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => deleteMedicine(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (reminders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={80} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>No Reminders</Text>
        <Text style={styles.emptyText}>Add medicines to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{reminders.length} Reminder{reminders.length !== 1 ? 's' : ''}</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminder}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  medicine: { fontSize: 16, color: '#64748B', marginTop: 4 },
  markBtn: { padding: 8 },
  deleteBtn: { 
    alignSelf: 'flex-end', 
    marginTop: 12, 
    padding: 8,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: '#1E293B', marginTop: 16 },
  emptyText: { fontSize: 16, color: '#64748B', marginTop: 8 },
});
