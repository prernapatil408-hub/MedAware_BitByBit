import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../utils/theme';

type HistoryItem = {
  id: string;
  medicineId: string;
  medicineName: string;
  status: 'taken' | 'missed';
  time: string;
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('history');
      const parsed = data ? JSON.parse(data) : [];

     
      const updated = parsed.map((item: HistoryItem) => {
        if (
          item.status !== 'taken' &&
          new Date(item.time) < new Date()
        ) {
          return { ...item, status: 'missed' };
        }
        return item;
      });

     
      const sorted = updated.sort(
        (a: HistoryItem, b: HistoryItem) =>
          new Date(b.time).getTime() -
          new Date(a.time).getTime()
      );

      setHistory(sorted);
    } catch (error) {
      console.log('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );


  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  
  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await AsyncStorage.removeItem('history');
            setHistory([]);
          },
        },
      ]
    );
  };

  /* ---------------- DAILY STATS ---------------- */
  const today = new Date().toDateString();

  const todayHistory = history.filter(
    (item) =>
      new Date(item.time).toDateString() === today
  );

  const takenCount = todayHistory.filter(
    (item) => item.status === 'taken'
  ).length;

  const missedCount = todayHistory.filter(
    (item) => item.status === 'missed'
  ).length;

  
  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View
      style={[
        styles.historyItem,
        item.status === 'taken'
          ? styles.takenItem
          : styles.missedItem,
      ]}
    >
      <Ionicons
        name={
          item.status === 'taken'
            ? 'checkmark-circle'
            : 'close-circle'
        }
        size={28}
        color={
          item.status === 'taken'
            ? COLORS.secondary
            : COLORS.danger
        }
      />

      <View style={styles.historyContent}>
        <Text style={styles.medicineName}>
          {item.medicineName}
        </Text>

        <Text style={styles.medicineId}>
          ID: {item.medicineId.slice(-6)}
        </Text>

        <Text
          style={[
            styles.status,
            {
              color:
                item.status === 'taken'
                  ? COLORS.secondary
                  : COLORS.danger,
            },
          ]}
        >
          {item.status.toUpperCase()}
        </Text>

        <Text style={styles.time}>
          {new Date(item.time).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* DAILY STATISTICS */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>
          Today's Statistics
        </Text>

        <View style={styles.statsRow}>
          <Text style={styles.takenText}>
            Taken: {takenCount}
          </Text>
          <Text style={styles.missedText}>
            Missed: {missedCount}
          </Text>
        </View>
      </View>

      {/* CLEAR BUTTON */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearHistory}
      >
        <Ionicons
          name="trash-outline"
          size={18}
          color="#fff"
        />
        <Text style={styles.clearText}>
          Clear History
        </Text>
      </TouchableOpacity>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          history.length === 0 && { flex: 1 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="time-outline"
              size={70}
              color="#B0BEC5"
            />
            <Text style={styles.emptyTitle}>
              No history yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  statsContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 16,
  },

  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  takenText: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '600',
  },

  missedText: {
    fontSize: 16,
    color: COLORS.danger,
    fontWeight: '600',
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
  },

  clearText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  historyItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },

  takenItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },

  missedItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },

  historyContent: {
    flex: 1,
    marginLeft: 12,
  },

  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  medicineId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  status: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 4,
  },

  time: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
});
