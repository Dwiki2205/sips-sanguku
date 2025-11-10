// /data/timeSlots.ts

import { TimeSlot } from '@/types/booking';

// Base slots data - mudah diubah di satu tempat
export const baseSlots: TimeSlot[] = [
  { time: '08.00 - 09.00', price: 'Rp 50.000', startHour: '08:00:00' },
  { time: '09.00 - 10.00', price: 'Rp 50.000', startHour: '09:00:00' },
  { time: '10.00 - 11.00', price: 'Rp 50.000', startHour: '10:00:00' },
  { time: '11.00 - 12.00', price: 'Rp 50.000', startHour: '11:00:00' },
  { time: '13.00 - 14.00', price: 'Rp 50.000', startHour: '13:00:00' },
  { time: '14.00 - 15.00', price: 'Rp 50.000', startHour: '14:00:00' },
  { time: '15.00 - 16.00', price: 'Rp 50.000', startHour: '15:00:00' },
  { time: '16.00 - 17.00', price: 'Rp 60.000', startHour: '16:00:00' },
  { time: '17.00 - 18.00', price: 'Rp 60.000', startHour: '17:00:00' },
  { time: '18.00 - 19.00', price: 'Rp 60.000', startHour: '18:00:00' },
  { time: '19.00 - 20.00', price: 'Rp 60.000', startHour: '19:00:00' },
  { time: '21.00 - 22.00', price: 'Rp 60.000', startHour: '21:00:00' },
  { time: '22.00 - 23.00', price: 'Rp 60.000', startHour: '22:00:00' },
];

// Helper function untuk mendapatkan base slots
export const getBaseSlots = (): TimeSlot[] => {
  return [...baseSlots]; // Return copy untuk menghindari mutasi langsung
};

// Helper function untuk update harga semua slot
export const updateAllPrices = (newPrice: string): TimeSlot[] => {
  return baseSlots.map(slot => ({
    ...slot,
    price: newPrice
  }));
};

// Helper function untuk update harga berdasarkan waktu
export const updateTimeBasedPrices = (morningPrice: string, eveningPrice: string): TimeSlot[] => {
  return baseSlots.map(slot => {
    // Tentukan apakah slot termasuk pagi/siang atau sore/malam
    const hour = parseInt(slot.startHour.split(':')[0]);
    const isEvening = hour >= 16; // Slot dari jam 16:00 ke atas lebih mahal
    
    return {
      ...slot,
      price: isEvening ? eveningPrice : morningPrice
    };
  });
};

// Helper function untuk menambahkan slot baru
export const addTimeSlot = (newSlot: Omit<TimeSlot, 'booked'>): TimeSlot[] => {
  const updatedSlots = [...baseSlots, { ...newSlot, booked: false }];
  // Urutkan berdasarkan startHour
  return updatedSlots.sort((a, b) => a.startHour.localeCompare(b.startHour));
};

// Helper function untuk menghapus slot
export const removeTimeSlot = (startHour: string): TimeSlot[] => {
  return baseSlots.filter(slot => slot.startHour !== startHour);
};