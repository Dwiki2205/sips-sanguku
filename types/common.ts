export interface DashboardStats {
  totalBooking: number;
  totalMembership: number;
  pendapatanHariIni: number;
  bookingHariIni: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'membership';
  description: string;
  timestamp: string;
  user: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}