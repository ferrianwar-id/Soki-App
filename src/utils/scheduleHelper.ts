import { StoreScheduleConfig, DaySchedule } from '../types';

export const defaultWeeklySchedule: DaySchedule[] = [
  { day: 'monday', dayName: 'Senin', isOpen: true, openTime: '00:00', closeTime: '23:59' },
  { day: 'tuesday', dayName: 'Selasa', isOpen: true, openTime: '00:00', closeTime: '23:59' },
  { day: 'wednesday', dayName: 'Rabu', isOpen: true, openTime: '00:00', closeTime: '23:59' },
  { day: 'thursday', dayName: 'Kamis', isOpen: true, openTime: '00:00', closeTime: '23:59' },
  { day: 'friday', dayName: 'Jumat', isOpen: true, openTime: '00:00', closeTime: '23:59' },
  { day: 'saturday', dayName: 'Sabtu', isOpen: true, openTime: '00:00', closeTime: '23:59' },
  { day: 'sunday', dayName: 'Minggu', isOpen: true, openTime: '00:00', closeTime: '23:59' },
];

export const defaultStoreSchedule: StoreScheduleConfig = {
  statusMode: 'force_open',
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

export interface JakartaTimeInfo {
  hours: number;
  minutes: number;
  seconds: number;
  dayIndex: number;
  timeString: string;
  formattedClock: string;
}

/**
 * Mendapatkan informasi waktu saat ini dalam Zona Waktu Indonesia Barat (WIB / Asia/Jakarta)
 * Bekerja konsisten di semua perangkat dan HP tanpa terpengaruh perbedaan zona waktu HP pelanggan
 */
export function getJakartaTimeInfo(): JakartaTimeInfo {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    let hourStr = '00';
    let minStr = '00';
    let secStr = '00';
    let weekdayStr = '';

    for (const part of parts) {
      if (part.type === 'hour') hourStr = part.value;
      if (part.type === 'minute') minStr = part.value;
      if (part.type === 'second') secStr = part.value;
      if (part.type === 'weekday') weekdayStr = part.value;
    }

    const weekdayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
    };
    const dayIndex = weekdayMap[weekdayStr] !== undefined ? weekdayMap[weekdayStr] : now.getDay();
    const hours = parseInt(hourStr, 10) || 0;
    const minutes = parseInt(minStr, 10) || 0;
    const seconds = parseInt(secStr, 10) || 0;
    const timeString = `${hourStr.padStart(2, '0')}:${minStr.padStart(2, '0')}`;
    const formattedClock = `${hourStr.padStart(2, '0')}.${minStr.padStart(2, '0')}.${secStr.padStart(2, '0')} WIB`;

    return { hours, minutes, seconds, dayIndex, timeString, formattedClock };
  } catch {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      dayIndex: now.getDay(),
      timeString: `${h}:${m}`,
      formattedClock: `${h}.${m}.${s} WIB`
    };
  }
}

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
 * Menghitung status buka/tutup toko secara real-time berdasarkan konfigurasi jadwal & zona waktu Jakarta
 */
export function getStoreStatus(config?: StoreScheduleConfig): StoreStatusResult {
  const schedule = config || defaultStoreSchedule;
  const timeInfo = getJakartaTimeInfo();
  
  const currentTimeString = timeInfo.timeString;
  const currentDayKey = DAY_INDEX_MAP[timeInfo.dayIndex];
  const weekly = schedule.weeklySchedule && schedule.weeklySchedule.length > 0
    ? schedule.weeklySchedule
    : defaultWeeklySchedule;
    
  const todaySchedule = weekly.find(d => d.day === currentDayKey) || defaultWeeklySchedule[0];
  const currentDayName = todaySchedule.dayName;

  // Case 1: Manual Force Open (Buka 24 Jam)
  if (schedule.statusMode === 'force_open') {
    return {
      isOpen: true,
      statusLabel: 'Buka (Mode Selalu Buka 24 Jam)',
      statusMode: 'force_open',
      currentDayName,
      currentTimeString,
      todaySchedule,
      nextOpeningText: 'Toko selalu buka 24 jam',
      reason: 'Admin mengaktifkan status toko buka 24 jam.'
    };
  }

  // Case 2: Manual Force Closed (Tutup Sementara / Libur)
  if (schedule.statusMode === 'force_closed') {
    return {
      isOpen: false,
      statusLabel: 'Tutup Sementara / Libur',
      statusMode: 'force_closed',
      currentDayName,
      currentTimeString,
      todaySchedule,
      nextOpeningText: 'Menunggu konfirmasi admin',
      reason: 'Toko sedang ditutup sementara oleh pengelola.'
    };
  }

  // Case 3: Automatic by Schedule (Sesuai Jam Operasional Harian)
  if (!todaySchedule.isOpen) {
    const nextOpen = findNextOpenDay(weekly, timeInfo.dayIndex);
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
    const nextOpen = findNextOpenDay(weekly, (timeInfo.dayIndex + 1) % 7);
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

