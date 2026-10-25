import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { slotToDate } from './booking';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Đặt nhắc nhở 15 phút trước giờ bắt đầu. Trả về id để huỷ sau này. */
export async function scheduleReminder(
  roomName: string,
  date: string,
  startHour: number,
): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined; // web không hỗ trợ lịch thông báo local

  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const triggerAt = new Date(slotToDate(date, startHour).getTime() - 15 * 60 * 1000);
  if (triggerAt.getTime() <= Date.now()) return undefined; // đã quá giờ nhắc

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Sắp đến giờ học nhóm ⏰',
      body: `${roomName} bắt đầu lúc ${startHour}:00 (còn 15 phút)`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerAt,
    },
  });
}

export async function cancelReminder(id?: string) {
  if (!id || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id);
}
