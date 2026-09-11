import { StoreScheduleConfig, DaySchedule } from '../types';

export const defaultWeeklySchedule: DaySchedule[] = [
  { day: 'monday', dayName: 'Senin', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'tuesday', dayName: 'Selasa', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'wednesday', dayName: 'Rabu', isOpen: true, openTime: '07:30', closeTime: '17:30' },
  { day: 'thursday', dayName: 'Kamis', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'friday', dayName: 'Jumat', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'saturday', dayName: 'Sabtu', isOpen: true, openTime: '08:00', closeTime: '15:00' },
  { day: 'sunday', dayName: 'Minggu', isOpen: false, openTime: '08:00', closeTime: '15:00' },
];

export const defaultStoreSchedule: StoreScheduleConfig = {
  statusMode: 'auto',
  closedTitle: 'Toko Sedang Tutup',
  closedMessage: 'Halo! Saat ini toko SOKI sedang tutup dan akan buka kembali sesuai jadwal operasional. Silakan cek jadwal buka kami di bawah ini.',
  allowPreorderWhatsApp: false,
  weeklySchedule: defaultWeeklySchedule,
  specialNote: ''
};

const DAY_INDEX_MAP: Record<number, DaySchedule['day']> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export interface StoreStatusResult {
  isOpen: boolean;
  statusLabel: string;
  statusMode: 'auto' | 'force_open' | 'force_closed';
  currentDayName: string;
  currentTimeString: string;
  todaySchedule?: DaySchedule;
  nextOpeningText: string;
  reason: string;
}

/**
 * Calculates real-time open/closed status based on schedule config
 */
export function getStoreStatus(config?: StoreScheduleConfig): StoreStatusResult {
  const schedule = config || defaultStoreSchedule;
  const now = new Date();
  
  // Format current hours and minutes "HH:mm"
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeString = `${currentHours}:${currentMinutes}`;
  
  const currentDayKey = DAY_INDEX_MAP[now.getDay()];
  const weekly = schedule.weeklySchedule && schedule.weeklySchedule.length > 0
    ? schedule.weeklySchedule
    : defaultWeeklySchedule;
    
  const todaySchedule = weekly.find(d => d.day === currentDayKey) || defaultWeeklySchedule[0];
  const currentDayName = todaySchedule.dayName;

  // Case 1: Manual Force Open
  if (schedule.statusMode === 'force_open') {
    return {
      isOpen: true,
      statusLabel: 'Buka (Mode Selalu Buka)',
      statusMode: 'force_open',
      currentDayName,
      currentTimeString,
      todaySchedule,
      nextOpeningText: 'Toko selalu buka 24 jam',
      reason: 'Admin mengaktifkan status selalu buka.'
    };
  }

  // Case 2: Manual Force Closed
  if (schedule.statusMode === 'force_closed') {
    return {
      isOpen: false,
      statusLabel: 'Tutup Sementara',
      statusMode: 'force_closed',
      currentDayName,
      currentTimeString,
      todaySchedule,
      nextOpeningText: 'Menunggu konfirmasi admin',
      reason: 'Toko sedang ditutup sementara oleh pengelola.'
    };
  }

  // Case 3: Automatic by Schedule
  // Check if today is marked as open
  if (!todaySchedule.isOpen) {
    // Find next open day
    const nextOpen = findNextOpenDay(weekly, now.getDay());
    return {
      isOpen: false,
      statusLabel: 'Tutup (Hari Libur)',
      statusMode: 'auto',
      currentDayName,
      currentTimeString,
      todaySchedule,
      nextOpeningText: nextOpen,
      reason: `Hari ini (${currentDayName}) toko libur.`
    };
  }

  // Today is open, check hours
  const openTime = todaySchedule.openTime || '08:00';
  const closeTime = todaySchedule.closeTime || '21:00';

  if (currentTimeString < openTime) {
    return {
      isOpen: false,
      statusLabel: 'Belum Buka',
      statusMode: 'auto',
      currentDayName,
      currentTimeString,
      todaySchedule,
      nextOpeningText: `Hari ini pukul ${openTime} WIB`,
      reason: `Toko buka pukul ${openTime} WIB hari ini.`
    };
  }

  if (currentTimeString >= closeTime) {
    const nextOpen = findNextOpenDay(weekly, (now.getDay() + 1) % 7);
    return {
      isOpen: false,
      statusLabel: 'Sudah Tutup',
      statusMode: 'auto',
      currentDayName,
      currentTimeString,
      todaySchedule,
      nextOpeningText: nextOpen,
      reason: `Toko sudah tutup pukul ${closeTime} WIB.`
    };
  }

  // Currently within operating hours
  return {
    isOpen: true,
    statusLabel: 'Sedang Buka',
    statusMode: 'auto',
    currentDayName,
    currentTimeString,
    todaySchedule,
    nextOpeningText: `Tutup hari ini pukul ${closeTime} WIB`,
    reason: `Jam operasional: ${openTime} - ${closeTime} WIB`
  };
}

function findNextOpenDay(weekly: DaySchedule[], startDayIndex: number): string {
  for (let offset = 0; offset < 7; offset++) {
    const checkIdx = (startDayIndex + offset) % 7;
    const dayKey = DAY_INDEX_MAP[checkIdx];
    const sched = weekly.find(d => d.day === dayKey);
    if (sched && sched.isOpen) {
      if (offset === 0) {
        return `Hari ini pukul ${sched.openTime} WIB`;
      } else if (offset === 1) {
        return `Besok (${sched.dayName}) pukul ${sched.openTime} WIB`;
      } else {
        return `${sched.dayName} pukul ${sched.openTime} WIB`;
      }
    }
  }
  return 'Jadwal akan diumumkan segera';
}
