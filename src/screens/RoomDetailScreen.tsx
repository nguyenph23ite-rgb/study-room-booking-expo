import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { ROOMS } from '../data/rooms';
import { RootStackParamList } from '../types';
import { CLOSE_HOUR, OPEN_HOUR, hasConflict, isHourTaken, next7Days, slotToDate } from '../utils/booking';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomDetail'>;

const DURATIONS = [1, 2, 3];

export default function RoomDetailScreen({ route, navigation }: Props) {
  const room = ROOMS.find((r) => r.id === route.params.roomId)!;
  const user = useStore((s) => s.user);
  const bookings = useStore((s) => s.bookings);
  const addBooking = useStore((s) => s.addBooking);

  const days = useMemo(next7Days, []);
  const [date, setDate] = useState(days[0].key);
  const [start, setStart] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);

  const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
  const end = start === null ? null : start + duration;
  const conflict = start !== null && end !== null && hasConflict(bookings, room.id, date, start, end);
  const overClose = end !== null && end > CLOSE_HOUR;

  const onBook = async () => {
    if (start === null || end === null) return;
    const res = await addBooking({
      roomId: room.id, roomName: room.name, date, startHour: start, endHour: end,
    });
    if (res.ok) {
      Alert.alert('Thành công', 'Đã đặt phòng! Bạn sẽ nhận nhắc nhở trước 15 phút.');
      navigation.goBack();
    } else {
      Alert.alert('Không thể đặt', res.reason);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{room.name}</Text>
      <Text style={styles.sub}>Tòa {room.building} • {room.capacity} người • {room.amenities.join(', ')}</Text>

      <Text style={styles.h}>Chọn ngày</Text>
      <View style={styles.row}>
        {days.map((d) => (
          <Pressable key={d.key} onPress={() => { setDate(d.key); setStart(null); }}
            style={[styles.chip, date === d.key && styles.active]}>
            <Text style={date === d.key && styles.activeText}>{d.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.h}>Giờ bắt đầu (xám = đã có người đặt)</Text>
      <View style={styles.row}>
        {hours.map((h) => {
          const taken = isHourTaken(bookings, room.id, date, h);
          const past = slotToDate(date, h).getTime() < Date.now();
          const disabled = taken || past;
          return (
            <Pressable key={h} disabled={disabled} onPress={() => setStart(h)}
              style={[styles.chip, disabled && styles.disabled, start === h && styles.active]}>
              <Text style={start === h ? styles.activeText : disabled ? styles.disabledText : undefined}>
                {h}:00
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.h}>Thời lượng</Text>
      <View style={styles.row}>
        {DURATIONS.map((d) => (
          <Pressable key={d} onPress={() => setDuration(d)} style={[styles.chip, duration === d && styles.active]}>
            <Text style={duration === d && styles.activeText}>{d} giờ</Text>
          </Pressable>
        ))}
      </View>

      {conflict && <Text style={styles.err}>⚠ Khoảng giờ này bị trùng với lịch đã đặt.</Text>}
      {overClose && <Text style={styles.err}>⚠ Vượt quá giờ đóng cửa ({CLOSE_HOUR}:00).</Text>}
      {!user && <Text style={styles.err}>Hãy đăng nhập ở tab "Tài khoản" để đặt phòng.</Text>}

      <Pressable
        disabled={start === null || conflict || overClose || !user}
        onPress={onBook}
        style={[styles.btn, (start === null || conflict || overClose || !user) && { opacity: 0.4 }]}>
        <Text style={styles.btnText}>
          {start === null ? 'Chọn giờ để đặt' : `Đặt ${start}:00 – ${end}:00`}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: '800' },
  sub: { color: '#555', marginBottom: 8 },
  h: { fontWeight: '700', marginTop: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#e5e7eb' },
  active: { backgroundColor: '#2563eb' },
  activeText: { color: '#fff' },
  disabled: { backgroundColor: '#f3f4f6' },
  disabledText: { color: '#bbb' },
  err: { color: '#dc2626', marginTop: 8 },
  btn: { marginTop: 20, backgroundColor: '#16a34a', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
