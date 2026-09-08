import { User, Room, Reservation, Payment, HotelService, Promotion, Review, Notification, DashboardStats } from '../types/types';
import api from './api';

// Helper to format date
const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const getDateDaysAhead = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// LocalStorage helpers
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Simulated Database Object with Database Syncing
export const mockDb = {
  // Pre-populate mockDb from real API endpoints
  init: async (): Promise<void> => {
    try {
      // 1. Fetch public resources (no authentication required)
      const [roomsRes, servicesRes, reviewsRes] = await Promise.all([
        api.get('/api/rooms').catch(() => null),
        api.get('/api/services').catch(() => null),
        api.get('/api/reviews').catch(() => null),
      ]);

      if (roomsRes?.data?.success) {
        // Flatten backend nested structure if necessary (roomType object to roomType string name)
        const rooms = roomsRes.data.data.map((r: any) => ({
          ...r,
          roomType: r.roomType?.name || r.roomType,
          images: r.images?.map((img: any) => img.url) || r.images || [],
        }));
        setStorageItem('tph_rooms', rooms);
      }
      if (servicesRes?.data?.success) {
        setStorageItem('tph_services', servicesRes.data.data);
      }
      if (reviewsRes?.data?.success) {
        const reviews = reviewsRes.data.data.map((rev: any) => ({
          ...rev,
          userName: rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : 'Client',
        }));
        setStorageItem('tph_reviews', reviews);
      }

      // 2. Fetch private resources (requires JWT token)
      const token = localStorage.getItem('tph_token');
      if (token) {
        const currentUser = JSON.parse(localStorage.getItem('tph_current_user') || '{}');
        const role = currentUser.role;

        if (role === 'ADMIN') {
          const [usersRes, reservationsRes, paymentsRes, promotionsRes] = await Promise.all([
            api.get('/api/admin/users').catch(() => null),
            api.get('/api/reservations').catch(() => null),
            api.get('/api/admin/payments').catch(() => null),
            api.get('/api/promotions').catch(() => null),
          ]);

          if (usersRes?.data?.success) setStorageItem('tph_users', usersRes.data.data);
          if (reservationsRes?.data?.success) {
            const reservations = reservationsRes.data.data.map((res: any) => ({
              ...res,
              promotionCode: res.promotion?.code || null,
            }));
            setStorageItem('tph_reservations', reservations);
          }
          if (paymentsRes?.data?.success) setStorageItem('tph_payments', paymentsRes.data.data);
          if (promotionsRes?.data?.success) setStorageItem('tph_promotions', promotionsRes.data.data);
        } else if (role === 'RECEPTIONIST') {
          const [reservationsRes, usersRes, paymentsRes] = await Promise.all([
            api.get('/api/reservations').catch(() => null),
            api.get('/api/admin/users').catch(() => null),
            api.get('/api/payments').catch(() => null),
          ]);

          if (reservationsRes?.data?.success) {
            const reservations = reservationsRes.data.data.map((res: any) => ({
              ...res,
              promotionCode: res.promotion?.code || null,
            }));
            setStorageItem('tph_reservations', reservations);
          }
          if (usersRes?.data?.success) setStorageItem('tph_users', usersRes.data.data);
          if (paymentsRes?.data?.success) setStorageItem('tph_payments', paymentsRes.data.data);
        } else if (role === 'CLIENT') {
          const [reservationsRes] = await Promise.all([
            api.get('/api/client/reservations').catch(() => null),
          ]);

          if (reservationsRes?.data?.success) {
            const reservations = reservationsRes.data.data.map((res: any) => ({
              ...res,
              promotionCode: res.promotion?.code || null,
            }));
            setStorageItem('tph_reservations', reservations);
          }
        }
      }
    } catch (error) {
      console.error('Error pre-populating mockDb cache from REST API:', error);
    }
  },

  getUsers: (): User[] => getStorageItem('tph_users', []),
  setUsers: (users: User[]) => {
    const oldUsers = mockDb.getUsers();
    setStorageItem('tph_users', users);

    // Sync changes to backend database
    if (users.length > oldUsers.length) {
      const added = users.filter((u) => !oldUsers.some((o) => o.id === u.id));
      added.forEach((u) => {
        api.post('/api/admin/users', {
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          password: 'password123', // default staff password
          phone: u.phone,
          role: u.role,
        }).catch(console.error);
      });
    } else if (users.length < oldUsers.length) {
      const deleted = oldUsers.filter((o) => !users.some((u) => u.id === o.id));
      deleted.forEach((o) => {
        api.delete(`/api/admin/users/${o.id}`).catch(console.error);
      });
    } else {
      users.forEach((u) => {
        const old = oldUsers.find((o) => o.id === u.id);
        if (old && (old.firstName !== u.firstName || old.lastName !== u.lastName || old.email !== u.email || old.phone !== u.phone || old.role !== u.role || old.enabled !== u.enabled)) {
          api.put(`/api/admin/users/${u.id}`, u).catch(console.error);
        }
      });
    }
  },

  getRooms: (): Room[] => getStorageItem('tph_rooms', []),
  setRooms: (rooms: Room[]) => {
    const oldRooms = mockDb.getRooms();
    setStorageItem('tph_rooms', rooms);

    // Sync changes to backend database
    if (rooms.length > oldRooms.length) {
      const added = rooms.filter((r) => !oldRooms.some((o) => o.id === r.id));
      added.forEach((r) => {
        // Resolve a dummy UUID roomTypeId based on standard types
        const typeId = r.roomType === 'STANDARD' ? 'standard-type-id' : r.roomType === 'DELUXE' ? 'deluxe-type-id' : r.roomType === 'SUITE' ? 'suite-type-id' : 'family-type-id';
        api.post('/api/rooms', {
          roomNumber: r.roomNumber,
          name: r.name,
          description: r.description,
          pricePerNight: r.pricePerNight,
          capacity: r.capacity,
          size: r.size,
          status: r.status,
          roomTypeId: typeId,
          images: r.images,
        }).catch(console.error);
      });
    } else if (rooms.length < oldRooms.length) {
      const deleted = oldRooms.filter((o) => !rooms.some((r) => r.id === o.id));
      deleted.forEach((o) => {
        api.delete(`/api/rooms/${o.id}`).catch(console.error);
      });
    } else {
      rooms.forEach((r) => {
        const old = oldRooms.find((o) => o.id === r.id);
        if (old) {
          if (old.status !== r.status) {
            api.patch(`/api/rooms/${r.id}/status`, { status: r.status }).catch(console.error);
          } else if (old.name !== r.name || old.pricePerNight !== r.pricePerNight || old.capacity !== r.capacity || old.size !== r.size || old.description !== r.description) {
            const typeId = r.roomType === 'STANDARD' ? 'standard-type-id' : r.roomType === 'DELUXE' ? 'deluxe-type-id' : r.roomType === 'SUITE' ? 'suite-type-id' : 'family-type-id';
            api.put(`/api/rooms/${r.id}`, {
              roomNumber: r.roomNumber,
              name: r.name,
              description: r.description,
              pricePerNight: r.pricePerNight,
              capacity: r.capacity,
              size: r.size,
              status: r.status,
              roomTypeId: typeId,
              images: r.images,
            }).catch(console.error);
          }
        }
      });
    }
  },

  getReservations: (): Reservation[] => getStorageItem('tph_reservations', []),
  setReservations: (reservations: Reservation[]) => {
    const oldRes = mockDb.getReservations();
    setStorageItem('tph_reservations', reservations);

    // Sync status modifications (check-in / check-out)
    reservations.forEach((r) => {
      const old = oldRes.find((o) => o.id === r.id);
      if (old && old.status !== r.status) {
        if (r.status === 'CHECKED_IN') {
          api.patch(`/api/reception/reservations/${r.id}/check-in`).catch(console.error);
        } else if (r.status === 'CHECKED_OUT') {
          api.patch(`/api/reception/reservations/${r.id}/check-out`).catch(console.error);
        } else {
          api.patch(`/api/reservations/${r.id}/status`, { status: r.status }).catch(console.error);
        }
      }
    });
  },

  getPayments: (): Payment[] => getStorageItem('tph_payments', []),
  setPayments: (payments: Payment[]) => {
    setStorageItem('tph_payments', payments);
  },

  getServices: (): HotelService[] => getStorageItem('tph_services', []),
  setServices: (services: HotelService[]) => {
    const oldServices = mockDb.getServices();
    setStorageItem('tph_services', services);

    if (services.length > oldServices.length) {
      const added = services.filter((s) => !oldServices.some((o) => o.id === s.id));
      added.forEach((s) => {
        api.post('/api/services', s).catch(console.error);
      });
    } else if (services.length < oldServices.length) {
      const deleted = oldServices.filter((o) => !services.some((s) => s.id === o.id));
      deleted.forEach((o) => {
        api.delete(`/api/services/${o.id}`).catch(console.error);
      });
    } else {
      services.forEach((s) => {
        const old = oldServices.find((o) => o.id === s.id);
        if (old && (old.name !== s.name || old.description !== s.description || old.price !== s.price || old.icon !== s.icon || old.active !== s.active)) {
          api.put(`/api/services/${s.id}`, s).catch(console.error);
        }
      });
    }
  },

  getPromotions: (): Promotion[] => getStorageItem('tph_promotions', []),
  setPromotions: (promotions: Promotion[]) => {
    const oldPromotions = mockDb.getPromotions();
    setStorageItem('tph_promotions', promotions);

    if (promotions.length > oldPromotions.length) {
      const added = promotions.filter((p) => !oldPromotions.some((o) => o.id === p.id));
      added.forEach((p) => {
        api.post('/api/promotions', p).catch(console.error);
      });
    } else if (promotions.length < oldPromotions.length) {
      const deleted = oldPromotions.filter((o) => !promotions.some((p) => p.id === o.id));
      deleted.forEach((o) => {
        api.delete(`/api/promotions/${o.id}`).catch(console.error);
      });
    } else {
      promotions.forEach((p) => {
        const old = oldPromotions.find((o) => o.id === p.id);
        if (old && (old.code !== p.code || old.discountType !== p.discountType || old.discountValue !== p.discountValue || old.startDate !== p.startDate || old.endDate !== p.endDate || old.maxUses !== p.maxUses || old.active !== p.active)) {
          api.put(`/api/promotions/${p.id}`, p).catch(console.error);
        }
      });
    }
  },

  getReviews: (): Review[] => getStorageItem('tph_reviews', []),
  setReviews: (reviews: Review[]) => {
    const oldReviews = mockDb.getReviews();
    setStorageItem('tph_reviews', reviews);

    // Sync review moderation approvals
    reviews.forEach((r) => {
      const old = oldReviews.find((o) => o.id === r.id);
      if (old && old.approved !== r.approved) {
        api.patch(`/api/reviews/${r.id}/approve`, { approved: r.approved }).catch(console.error);
      }
    });
  },

  getNotifications: (): Notification[] => getStorageItem('tph_notifications', []),
  setNotifications: (notifications: Notification[]) => {
    setStorageItem('tph_notifications', notifications);
  },

  resetDb: () => {
    localStorage.removeItem('tph_users');
    localStorage.removeItem('tph_rooms');
    localStorage.removeItem('tph_reservations');
    localStorage.removeItem('tph_payments');
    localStorage.removeItem('tph_services');
    localStorage.removeItem('tph_promotions');
    localStorage.removeItem('tph_reviews');
    localStorage.removeItem('tph_notifications');
    mockDb.init();
  }
};

// Database operation simulation services
export const mockServices = {
  checkAvailability: (roomId: string, checkInStr: string, checkOutStr: string, excludeResId?: string): boolean => {
    const reservations = mockDb.getReservations();
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    const overlaps = reservations.filter((res) => {
      if (res.roomId !== roomId) return false;
      if (excludeResId && res.id === excludeResId) return false;
      if (res.status === 'CANCELLED' || res.status === 'CHECKED_OUT') return false;

      const resCheckIn = new Date(res.checkIn);
      const resCheckOut = new Date(res.checkOut);

      return checkIn < resCheckOut && checkOut > resCheckIn;
    });

    return overlaps.length === 0;
  },

  getDashboardStats: (): DashboardStats => {
    const reservations = mockDb.getReservations();
    const rooms = mockDb.getRooms();
    const users = mockDb.getUsers();
    const payments = mockDb.getPayments();

    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE').length;
    const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const cleaningRooms = rooms.filter((r) => r.status === 'CLEANING').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE').length;

    const totalReservations = reservations.length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReservations = reservations.filter((r) => new Date(r.createdAt) >= thirtyDaysAgo);
    const monthlyReservations = recentReservations.length;

    const completedPayments = payments.filter((p) => p.status === 'PAID');
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalClients = users.filter((u) => u.role === 'CLIENT').length;
    
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const revenueByMonth = [
      { month: 'Mars', revenue: 1850000 },
      { month: 'Avril', revenue: 2200000 },
      { month: 'Mai', revenue: 2600000 },
      { month: 'Juin', revenue: 3100000 },
      { month: 'Juillet', revenue: 3900000 },
      { month: 'Août', revenue: totalRevenue > 0 ? Math.min(totalRevenue, 4500000) : 1500000 },
    ];

    const reservationsByMonth = [
      { month: 'Mars', count: 18 },
      { month: 'Avril', count: 22 },
      { month: 'Mai', count: 25 },
      { month: 'Juin', count: 32 },
      { month: 'Juillet', count: 48 },
      { month: 'Août', count: totalReservations },
    ];

    const occupancyRateByMonth = [
      { month: 'Mars', rate: 45 },
      { month: 'Avril', rate: 52 },
      { month: 'Mai', rate: 58 },
      { month: 'Juin', rate: 68 },
      { month: 'Juillet', rate: 82 },
      { month: 'Août', rate: occupancyRate },
    ];

    const bookingCounts: Record<string, number> = {};
    reservations.forEach((res) => {
      const room = rooms.find((r) => r.id === res.roomId);
      if (room) {
        const name = room.name.split(' ').slice(0, 2).join(' ');
        bookingCounts[name] = (bookingCounts[name] || 0) + 1;
      }
    });

    const mostBookedRooms = Object.entries(bookingCounts)
      .map(([roomName, count]) => ({ roomName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    if (mostBookedRooms.length === 0) {
      mostBookedRooms.push(
        { roomName: 'Chambre Deluxe', count: 5 },
        { roomName: 'Suite Premium', count: 3 },
        { roomName: 'Chambre Standard', count: 2 }
      );
    }

    return {
      totalReservations,
      monthlyReservations,
      totalRevenue,
      totalClients,
      availableRooms,
      occupiedRooms,
      cleaningRooms,
      maintenanceRooms,
      occupancyRate,
      revenueByMonth,
      reservationsByMonth,
      occupancyRateByMonth,
      mostBookedRooms,
    };
  }
};
