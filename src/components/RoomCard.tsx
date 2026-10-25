import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Room } from '../types';

export const CARD_HEIGHT = 96; // chiều cao cố định -> dùng cho getItemLayout

type Props = { room: Room; onPress: (id: string) => void };

function RoomCardBase({ room, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(room.id)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{room.name}</Text>
        <Text style={styles.sub}>Tòa {room.building} • {room.capacity} người</Text>
        <Text style={styles.amen} numberOfLines={1}>{room.amenities.join(' · ')}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

// React.memo: chỉ render lại khi `room` hoặc `onPress` đổi
export const RoomCard = memo(RoomCardBase);

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT - 12,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 17, fontWeight: '700' },
  sub: { color: '#555', marginTop: 2 },
  amen: { color: '#888', marginTop: 4, fontSize: 12 },
  arrow: { fontSize: 28, color: '#aaa' },
});
