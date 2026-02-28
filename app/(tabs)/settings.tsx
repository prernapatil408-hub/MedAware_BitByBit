import React from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <Text style={styles.title}>Settings</Text>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="notifications-outline" size={22} color="#3B82F6" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Push Notifications</Text>
              <Text style={styles.subLabel}>Receive reminder alerts</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={notifications ? '#2563EB' : '#F1F5F9'}
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="moon-outline" size={22} color="#6366F1" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Dark Mode</Text>
              <Text style={styles.subLabel}>Reduce eye strain at night</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#CBD5E1', true: '#C7D2FE' }}
            thumbColor={darkMode ? '#4F46E5' : '#F1F5F9'}
          />
        </View>
      </View>

      {/* Security Section */}
      <Text style={styles.sectionTitle}>Security</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="camera-outline" size={22} color="#10B981" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Camera Verification</Text>
              <Text style={styles.subLabel}>Verify medicine intake</Text>
            </View>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>ON</Text>
          </View>
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
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  subLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  badge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});