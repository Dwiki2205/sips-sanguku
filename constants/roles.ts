export const ROLES = {
  OWNER: 'Owner',
  PEGAWAI: 'Pegawai', 
  PELANGGAN: 'Pelanggan'
} as const;

export const PERMISSIONS = {
  ALL: 'all',
  VIEW_BOOKING: 'view_booking',
  VIEW_MEMBERSHIP: 'view_membership',
  SEARCH_BOOKING: 'search_booking',
  SEARCH_MEMBERSHIP: 'search_membership',
  ADD_BOOKING: 'add_booking',
  ADD_MEMBERSHIP: 'add_membership'
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [PERMISSIONS.ALL],
  [ROLES.PEGAWAI]: [
    PERMISSIONS.VIEW_BOOKING,
    PERMISSIONS.VIEW_MEMBERSHIP,
    PERMISSIONS.SEARCH_BOOKING,
    PERMISSIONS.SEARCH_MEMBERSHIP
  ],
  [ROLES.PELANGGAN]: [
    PERMISSIONS.ADD_BOOKING,
    PERMISSIONS.VIEW_BOOKING,
    PERMISSIONS.ADD_MEMBERSHIP,
    PERMISSIONS.VIEW_MEMBERSHIP
  ]
} as const;