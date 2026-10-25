import { Booking } from '../types';

export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 20;

/** Hai khoảng [s1,e1) và [s2,e2) giao nhau khi s1 < e2 && s2 < e1 */
export function hasConflict(
  bookings: Booking[],
  roomId: string,
  date: string,
  startHour: number,
  endHour: number,
): boolean {
  return bookings.some(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      startHour < b.endHour &&
      b.startHour < endHour,
  );
}

/** Slot đã bị đặt hay chưa (dùng để tô xám nút giờ) */
export function isHourTaken(
  bookings: Booking[],
  roomId: string,
  date: string,
  hour: number,
): boolean {
  return hasConflict(bookings, roomId, date, hour, hour + 1);
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function next7Days(): { key: string; label: string }[] {
  const names = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { key: toDateKey(d), label: `${names[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}` };
  });
}

export function slotToDate(date: string, hour: number): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hour, 0, 0);
}
