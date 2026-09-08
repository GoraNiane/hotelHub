export type UserRole = 'CLIENT' | 'RECEPTIONIST' | 'ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';

export type RoomTypeCategory = 'STANDARD' | 'DELUXE' | 'SUITE' | 'FAMILY';

export interface RoomType {
  id: string;
  name: RoomTypeCategory;
  displayName: string;
  description: string;
  pricePerNight: number;
  capacity: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  size: number; // in m²
  status: RoomStatus;
  roomType: RoomTypeCategory;
  amenities: string[];
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';

export interface Reservation {
  id: string;
  reservationNumber: string;
  userId: string;
  user?: User; // Joined client info
  roomId: string;
  room?: Room; // Joined room info
  checkIn: string; // ISO date format YYYY-MM-DD
  checkOut: string; // ISO date format YYYY-MM-DD
  adults: number;
  children: number;
  numberOfNights: number;
  totalPrice: number;
  status: ReservationStatus;
  promotionCode?: string;
  payments?: Payment[]; // Associated transaction list
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'CASH' | 'WAVE' | 'ORANGE_MONEY' | 'CARD';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string;
  paidAt?: string;
  createdAt: string;
}

export interface HotelService {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string; // Lucide icon name
  active: boolean;
}

export interface Promotion {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  currentUses: number;
  active: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string; // denormalized for display ease
  roomId?: string;
  roomName?: string;
  rating: number; // 1 to 5
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  createdAt: string;
}

export interface DashboardStats {
  totalReservations: number;
  monthlyReservations: number;
  totalRevenue: number;
  totalClients: number;
  availableRooms: number;
  occupiedRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  revenueByMonth: { month: string; revenue: number }[];
  reservationsByMonth: { month: string; count: number }[];
  occupancyRateByMonth: { month: string; rate: number }[];
  mostBookedRooms: { roomName: string; count: number }[];
}
