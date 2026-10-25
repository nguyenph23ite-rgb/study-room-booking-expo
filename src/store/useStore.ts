import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, Filters } from '../types';
import { hasConflict } from '../utils/booking';
import { scheduleReminder, cancelReminder } from '../utils/notifications';

const DEFAULT_FILTERS: Filters = { query: '', minCapacity: 0, building: null };

type AddResult = { ok: true } | { ok: false; reason: string };

type State = {
  // session
  user: string | null;
  login: (name: string) => void;
  logout: () => void;
  // bookings
  bookings: Booking[];
  addBooking: (args: {
    roomId: string;
    roomName: string;
    date: string;
    startHour: number;
    endHour: number;
  }) => Promise<AddResult>;
  cancelBooking: (id: string) => Promise<void>;
  // filters
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      login: (name) => set({ user: name.trim() }),
      logout: () => set({ user: null }),

      bookings: [],
      addBooking: async ({ roomId, roomName, date, startHour, endHour }) => {
        if (!get().user) return { ok: false, reason: 'Bạn cần đăng nhập trước.' };
        // Chặn trùng giờ
        if (hasConflict(get().bookings, roomId, date, startHour, endHour)) {
          return { ok: false, reason: 'Khung giờ này đã có người đặt.' };
        }
        const notificationId = await scheduleReminder(roomName, date, startHour);
        // kiểm tra lại sau await để tránh race condition
        if (hasConflict(get().bookings, roomId, date, startHour, endHour)) {
          await cancelReminder(notificationId);
          return { ok: false, reason: 'Khung giờ này vừa được đặt.' };
        }
        const booking: Booking = {
          id: `${Date.now()}`,
          roomId,
          date,
          startHour,
          endHour,
          notificationId,
        };
        set((s) => ({ bookings: [...s.bookings, booking] }));
        return { ok: true };
      },
      cancelBooking: async (id) => {
        const b = get().bookings.find((x) => x.id === id);
        await cancelReminder(b?.notificationId);
        set((s) => ({ bookings: s.bookings.filter((x) => x.id !== id) }));
      },

      filters: DEFAULT_FILTERS,
      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
    }),
    {
      name: 'study-room-store',
      storage: createJSONStorage(() => AsyncStorage),
      // chỉ lưu session + bookings, không lưu filters
      partialize: (s) => ({ user: s.user, bookings: s.bookings }),
    },
  ),
);
