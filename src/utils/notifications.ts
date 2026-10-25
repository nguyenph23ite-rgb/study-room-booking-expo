import { Platform } from 'react-native';
import { slotToDate } from './booking';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;
let handlerRegistered = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') return null;

  if (notificationsModule) return notificationsModule;

  try {
    const Notifications = await import('expo-notifications');

    if (!handlerRegistered) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      handlerRegistered = true;
    }

    notificationsModule = Notifications;
    return Notifications;
  } catch (error) {
    console.warn(
      '[notifications] Module không khả dụng trong môi trường hiện tại:',
      error,
    );
    return null;
  }
}

/** Đặt nhắc nhở 15 phút trước giờ bắt đầu. Trả về id để huỷ sau này. */
export async function scheduleReminder(
  roomName: string,
  date: string,
  startHour: number,
): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;

  const triggerAt = new Date(
    slotToDate(date, startHour).getTime() - 15 * 60 * 1000,
  );

  if (triggerAt.getTime() <= Date.now()) return undefined;

  const Notifications = await getNotifications();
  if (!Notifications) return undefined;

  try {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return undefined;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sắp đến giờ học nhóm ⏰',
        body: `${roomName} bắt đầu lúc ${startHour}:00 (còn 15 phút)`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerAt,
      },
    });
  } catch (error) {
    console.warn('[notifications] Không thể đặt nhắc lịch:', error);
    return undefined;
  }
}

export async function cancelReminder(id?: string): Promise<void> {
  if (!id || Platform.OS === 'web') return;

  const Notifications = await getNotifications();
  if (!Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.warn('[notifications] Không thể huỷ nhắc lịch:', error);
  }
}
