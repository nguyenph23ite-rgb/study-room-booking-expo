import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { ROOMS, BUILDING_LIST } from '../data/rooms';
import { RoomCard, CARD_HEIGHT } from '../components/RoomCard';
import { RootStackParamList, Room } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CAPACITIES = [0, 4, 6, 8];

export default function RoomListScreen() {
  const navigation = useNavigation<Nav>();
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);

  const data = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return ROOMS.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q)) &&
        r.capacity >= filters.minCapacity &&
        (!filters.building || r.building === filters.building),
    );
  }, [filters]);

  // callback ổn định -> RoomCard (memo) không render lại vô ích
  const onPressRoom = useCallback(
    (id: string) => navigation.navigate('RoomDetail', { roomId: id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Room }) => <RoomCard room={item} onPress={onPressRoom} />,
    [onPressRoom],
  );
  const keyExtractor = useCallback((r: Room) => r.id, []);
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: CARD_HEIGHT, offset: CARD_HEIGHT * index, index }),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Tìm tên phòng..."
          value={filters.query}
          onChangeText={(t) => setFilters({ query: t })}
        />
        <View style={styles.row}>
          {CAPACITIES.map((c) => (
            <Chip
              key={c}
              label={c === 0 ? 'Mọi sức chứa' : `≥ ${c}`}
              active={filters.minCapacity === c}
              onPress={() => setFilters({ minCapacity: c })}
            />
          ))}
        </View>
        <View style={styles.row}>
          <Chip label="Mọi tòa" active={!filters.building} onPress={() => setFilters({ building: null })} />
          {BUILDING_LIST.map((b) => (
            <Chip key={b} label={`Tòa ${b}`} active={filters.building === b} onPress={() => setFilters({ building: b })} />
          ))}
          <Chip label="Xóa lọc" active={false} onPress={resetFilters} />
        </View>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        ListEmptyComponent={<Text style={styles.empty}>Không có phòng phù hợp.</Text>}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
      />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  filters: { padding: 12, backgroundColor: '#fff', gap: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 40, color: '#777' },
});
