import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

export interface Medicine {
  id: string;
  reminderId : string,
  name: string;
  time: string;
  dosage: string;
  totalDosage: string;
}

class NotificationService {
  static async initialize() {
    if (!Device.isDevice) return;

    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      alert('Notification permission required!');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarm-channel', {
        name: 'Medicine Alarm',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 500, 500, 500],
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }
  }

  // 🔔 Schedule Reminder
  static async scheduleReminder(medicine: Medicine) {
    const alarmDate = new Date(medicine.time);

    if (alarmDate <= new Date()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 MEDICINE ALARM',
        body: `Take ${medicine.name} - ${medicine.dosage}`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          medicineId: medicine.id,
          reminderId : medicine.reminderId, // 🔥 important
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alarmDate,
      },
    });

    // Save medicine locally
    const existing = await AsyncStorage.getItem('medicines');
    const medicines = existing ? JSON.parse(existing) : [];

    medicines.push(medicine);

    await AsyncStorage.setItem('medicines', JSON.stringify(medicines));
  }

  // 💤 Snooze 5 minutes
  static async snoozeAlarm(medicine: Medicine) {
    await this.stopAlarm();

    const snoozeDate = new Date();
    snoozeDate.setMinutes(snoozeDate.getMinutes() + 5);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ SNOOZED MEDICINE',
        body: `Reminder: ${medicine.name}`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          medicineId: medicine.id,
          reminderId : medicine.reminderId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: snoozeDate,
      },
    });
  }

  // 🛑 Stop alarm completely
  static async stopAlarm() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  }

  static async getMedicines(): Promise<Medicine[]> {
    const data = await AsyncStorage.getItem('medicines');
    return data ? JSON.parse(data) : [];
  }

  // 📜 Add to history
  static async addToHistory(
    medicineId: string,
    status: 'taken' | 'missed'
  ) {
    const medicines = await this.getMedicines();
    const med = medicines.find((m) => m.id === medicineId);

    const existing = await AsyncStorage.getItem('history');
    const history = existing ? JSON.parse(existing) : [];

    const newEntry = {
      id: Date.now().toString(),
      medicineId,
      medicineName: med?.name || 'Unknown',
      status,
      time: new Date().toISOString(),
    };

    history.unshift(newEntry);

    await AsyncStorage.setItem('history', JSON.stringify(history));
  }
}

export default NotificationService;