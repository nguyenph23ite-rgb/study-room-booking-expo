export type Room = {
  id: string;
  name: string;
  building: string;
  capacity: number;
  amenities: string[];
};

export type Booking = {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 8..19
  endHour: number; // 9..20 (exclusive)
  notificationId?: string;
};

export type Filters = {
  query: string;
  minCapacity: number; // 0 = tất cả
  building: string | null;
};

export type RootStackParamList = {
  Tabs: undefined;
  RoomDetail: { roomId: string };
};
