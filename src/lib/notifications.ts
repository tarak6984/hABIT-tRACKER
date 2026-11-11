import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { Habit } from '@/store/types';

const CHANNEL_ID = 'habit-reminders';
const isSupported = Platform.OS !== 'web';

export function configureNotifications(): void {
  if (!isSupported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isSupported) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Habit reminders',
      importance: AndroidImportance.HIGH,
      lightColor: '#6C5CE7',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

const nudges = [
  'Your garden is waiting for you 🌱',
  'A tiny step today keeps your streak alive 🔥',
  'Your companion is cheering for you 💜',
  'Two minutes is all it takes ✨',
];

export async function scheduleHabitReminders(habit: Habit): Promise<string[]> {
  if (!isSupported || !habit.reminder) return [];
  const isGranted = await ensureNotificationPermission();
  if (!isGranted) return [];

  const { hour, minute } = habit.reminder;
  const content: Notifications.NotificationContentInput = {
    title: `${habit.emoji} ${habit.name}`,
    body: nudges[habit.name.length % nudges.length],
    data: { habitId: habit.id },
  };

  if (habit.days.length === 7) {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL_ID },
    });
    return [id];
  }

  // Weekly triggers count weekdays from 1 (Sunday), our schedule counts from 0.
  return Promise.all(
    habit.days.map((day) =>
      Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1,
          hour,
          minute,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );
}

export async function cancelReminders(ids: string[]): Promise<void> {
  if (!isSupported) return;
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function cancelAllReminders(): Promise<void> {
  if (!isSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
