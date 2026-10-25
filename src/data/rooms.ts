import { Room } from '../types';

const BUILDINGS = ['A', 'B', 'C', 'D'];
const AMENITIES = ['Máy chiếu', 'Bảng trắng', 'Ổ cắm', 'Điều hòa', 'Wifi mạnh', 'TV'];

// Sinh 40 phòng để thấy rõ hiệu năng FlatList
export const ROOMS: Room[] = Array.from({ length: 40 }, (_, i) => {
  const building = BUILDINGS[i % BUILDINGS.length];
  const floor = Math.floor(i / BUILDINGS.length) + 1;
  return {
    id: `room-${i + 1}`,
    name: `Phòng ${building}${floor}0${(i % 5) + 1}`,
    building,
    capacity: [2, 4, 6, 8, 10][i % 5],
    amenities: [AMENITIES[i % 6], AMENITIES[(i + 2) % 6], AMENITIES[(i + 4) % 6]],
  };
});

export const BUILDING_LIST = BUILDINGS;
