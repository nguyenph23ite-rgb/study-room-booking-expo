
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useStore } from '../store/useStore';
import { ROOMS } from '../data/rooms';

export default function MyBookingsScreen() {
  const bookings = useStore((s) => s.bookings);
  const cancelBooking = useStore((s) => s.cancelBooking);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sorted = [...bookings].sort((a, b) =>
    a.date === b.date
      ? a.startHour - b.startHour
      : a.date.localeCompare(b.date),
  );

  const requestCancel = (id: string) => {
    if (Platform.OS === 'web') {
      setPendingId(id);
      return;
    }

    Alert.alert('Hủy đặt phòng?', 'Bạn có chắc muốn hủy lịch này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy phòng',
        style: 'destructive',
        onPress: () => {
          void cancelBooking(id);
        },
      },
    ]);
  };

  const confirmCancel = async () => {
    if (!pendingId) return;

    const id = pendingId;
    setPendingId(null);

    try {
      await cancelBooking(id);
    } catch (error) {
      console.error('Không thể hủy đặt phòng:', error);
      if (Platform.OS === 'web') {
        window.alert('Không thể hủy đặt phòng. Vui lòng thử lại.');
      }
    }
  };

  return (
    <FlatList
      data={sorted}
      keyExtractor={(b) => b.id}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListEmptyComponent={
        <Text style={styles.empty}>Bạn chưa đặt phòng nào.</Text>
      }
      renderItem={({ item }) => {
        const room = ROOMS.find((r) => r.id === item.roomId);

        return (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{room?.name}</Text>
              <Text>
                {item.date} • {item.startHour}:00 – {item.endHour}:00
              </Text>
            </View>

            <Pressable
              onPress={() => requestCancel(item.id)}
              accessibilityRole="button"
              accessibilityLabel="Hủy đặt phòng"
            >
              <Text style={styles.cancel}>Hủy</Text>
            </Pressable>
          </View>
        );
      }}
      ListFooterComponent={
        Platform.OS === 'web' && pendingId ? (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Hủy đặt phòng?</Text>
            <Text>Bạn có chắc muốn hủy lịch đặt này không?</Text>
            <View style={styles.actions}>
              <Pressable
                style={styles.keepButton}
                onPress={() => setPendingId(null)}
              >
                <Text>Giữ lại</Text>
              </Pressable>
              <Pressable
                style={styles.confirmButton}
                onPress={() => void confirmCancel()}
              >
                <Text style={styles.confirmText}>Xác nhận hủy</Text>
              </Pressable>
            </View>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
  },
  title: { fontWeight: '700', fontSize: 16 },
  cancel: { color: '#dc2626', fontWeight: '700', padding: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: '#777' },
  confirmBox: {
    marginTop: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  confirmTitle: { fontSize: 17, fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  keepButton: { padding: 10 },
  confirmButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  confirmText: { color: '#fff', fontWeight: '700' },
});
