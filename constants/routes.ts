export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTRASI: '/registrasi',
  LUPA_PASSWORD: '/lupa-password',
  
  // Owner routes
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_BOOKING: '/owner/booking',
  OWNER_BOOKING_TAMBAH: '/owner/booking/tambah',
  OWNER_BOOKING_EDIT: '/owner/booking/[id]',
  OWNER_MEMBERSHIP: '/owner/membership',
  OWNER_MEMBERSHIP_TAMBAH: '/owner/membership/tambah',
  OWNER_MEMBERSHIP_EDIT: '/owner/membership/[id]',
  
  // Pegawai routes
  PEGAWAI_DASHBOARD: '/pegawai/dashboard',
  PEGAWAI_BOOKING: '/pegawai/booking',
  PEGAWAI_MEMBERSHIP: '/pegawai/membership',
  
  // Pelanggan routes
  PELANGGAN_DASHBOARD: '/pelanggan/dashboard',
  PELANGGAN_BOOKING: '/pelanggan/booking',
  PELANGGAN_BOOKING_TAMBAH: '/pelanggan/booking/tambah',
  PELANGGAN_MEMBERSHIP: '/pelanggan/membership',
  PELANGGAN_MEMBERSHIP_TAMBAH: '/pelanggan/membership/tambah'
} as const;