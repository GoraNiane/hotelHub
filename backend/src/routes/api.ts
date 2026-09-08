import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { RoomController } from '../controllers/roomController';
import { ReservationController } from '../controllers/reservationController';
import { ReceptionController } from '../controllers/receptionController';
import { AdminController } from '../controllers/adminController';
import { ServiceController } from '../controllers/serviceController';
import { PromotionController } from '../controllers/promotionController';
import { ReviewController } from '../controllers/reviewController';
import { PaymentController } from '../controllers/paymentController';

import { authenticate, authorize } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  roomSchema,
  reservationSchema,
  paymentSchema,
  reviewSchema,
  promotionSchema,
  serviceSchema,
} from '../validators/schemas';

const router = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES (/api/auth)
// ==========================================
router.post('/auth/register', validateBody(registerSchema), AuthController.register);
router.post('/auth/login', validateBody(loginSchema), AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.get('/auth/me', authenticate, AuthController.me);
router.put('/auth/profile', authenticate, validateBody(profileUpdateSchema), AuthController.updateProfile);

// ==========================================
// 2. ROOM ROUTES (/api/rooms)
// ==========================================
router.get('/rooms', RoomController.getAllRooms);
router.get('/rooms/available', RoomController.getAvailableRooms);
router.get('/rooms/:id', RoomController.getRoomById);
router.post('/rooms', authenticate, authorize('ADMIN'), validateBody(roomSchema), RoomController.createRoom);
router.put('/rooms/:id', authenticate, authorize('ADMIN'), validateBody(roomSchema), RoomController.updateRoom);
router.delete('/rooms/:id', authenticate, authorize('ADMIN'), RoomController.deleteRoom);
router.patch('/rooms/:id/status', authenticate, authorize('ADMIN', 'RECEPTIONIST'), RoomController.updateRoomStatus);

// ==========================================
// 3. RESERVATION ROUTES (/api/reservations)
// ==========================================
router.get('/reservations', authenticate, ReservationController.getAllReservations);
router.get('/reservations/:id', authenticate, ReservationController.getReservationById);
router.post('/reservations', authenticate, validateBody(reservationSchema), ReservationController.createReservation);
router.patch('/reservations/:id/status', authenticate, authorize('ADMIN', 'RECEPTIONIST'), ReservationController.updateReservationStatus);
router.put('/reservations/:id', authenticate, authorize('ADMIN', 'RECEPTIONIST'), ReservationController.updateReservationStatus);
router.delete('/reservations/:id', authenticate, authorize('ADMIN'), ReservationController.deleteReservation);

// ==========================================
// 4. CLIENT SPECIFIC ROUTES (/api/client)
// ==========================================
router.get('/client/reservations', authenticate, authorize('CLIENT'), ReservationController.getClientReservations);
router.get('/client/reservations/:id', authenticate, authorize('CLIENT'), ReservationController.getReservationById);
router.post('/client/reviews', authenticate, authorize('CLIENT'), validateBody(reviewSchema), ReviewController.createReview);
router.get('/client/profile', authenticate, authorize('CLIENT'), AuthController.me);
router.put('/client/profile', authenticate, authorize('CLIENT'), validateBody(profileUpdateSchema), AuthController.updateProfile);

// ==========================================
// 5. RECEPTIONIST ROUTES (/api/reception)
// ==========================================
router.get('/reception/dashboard', authenticate, authorize('ADMIN', 'RECEPTIONIST'), ReceptionController.getDashboard);
router.get('/reception/today-arrivals', authenticate, authorize('ADMIN', 'RECEPTIONIST'), ReceptionController.getTodayArrivals);
router.get('/reception/today-departures', authenticate, authorize('ADMIN', 'RECEPTIONIST'), ReceptionController.getTodayDepartures);
router.patch('/reception/reservations/:id/check-in', authenticate, authorize('ADMIN', 'RECEPTIONIST'), ReceptionController.checkIn);
router.patch('/reception/reservations/:id/check-out', authenticate, authorize('ADMIN', 'RECEPTIONIST'), ReceptionController.checkOut);

// ==========================================
// 6. ADMINISTRATOR ROUTES (/api/admin)
// ==========================================
router.get('/admin/dashboard', authenticate, authorize('ADMIN'), AdminController.getDashboard);
router.get('/admin/users', authenticate, authorize('ADMIN'), AdminController.getUsers);
router.post('/admin/users', authenticate, authorize('ADMIN'), AdminController.createUser);
router.put('/admin/users/:id', authenticate, authorize('ADMIN'), AdminController.updateUser);
router.delete('/admin/users/:id', authenticate, authorize('ADMIN'), AdminController.deleteUser);
router.get('/admin/customers', authenticate, authorize('ADMIN'), AdminController.getCustomers);
router.get('/admin/receptionists', authenticate, authorize('ADMIN'), AdminController.getReceptionists);
router.get('/admin/payments', authenticate, authorize('ADMIN'), AdminController.getPayments);

// ==========================================
// 7. SERVICES ROUTES (/api/services)
// ==========================================
router.get('/services', ServiceController.getAllServices);
router.post('/services', authenticate, authorize('ADMIN'), validateBody(serviceSchema), ServiceController.createService);
router.put('/services/:id', authenticate, authorize('ADMIN'), validateBody(serviceSchema), ServiceController.updateService);
router.delete('/services/:id', authenticate, authorize('ADMIN'), ServiceController.deleteService);

// ==========================================
// 8. PROMOTIONS ROUTES (/api/promotions)
// ==========================================
router.get('/promotions', authenticate, authorize('ADMIN'), PromotionController.getAllPromotions);
router.get('/promotions/validate/:code', PromotionController.validatePromoCode);
router.post('/promotions', authenticate, authorize('ADMIN'), validateBody(promotionSchema), PromotionController.createPromotion);
router.put('/promotions/:id', authenticate, authorize('ADMIN'), validateBody(promotionSchema), PromotionController.updatePromotion);
router.delete('/promotions/:id', authenticate, authorize('ADMIN'), PromotionController.deletePromotion);

// ==========================================
// 9. REVIEWS ROUTES (/api/reviews)
// ==========================================
router.get('/reviews', ReviewController.getAllReviews);
router.patch('/reviews/:id/approve', authenticate, authorize('ADMIN'), ReviewController.toggleApproval);
router.delete('/reviews/:id', authenticate, authorize('ADMIN'), ReviewController.deleteReview);

// ==========================================
// 10. PAYMENT ROUTES (/api/payments)
// ==========================================
router.post('/payments', authenticate, validateBody(paymentSchema), PaymentController.processPayment);
router.get('/payments', authenticate, authorize('ADMIN'), PaymentController.getPayments);

export default router;
