import prisma from '../config/db';
import { RoomService } from './roomService';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/customErrors';

export class ReservationService {
  private static generateReservationNumber(): string {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `TPH-${randomNum}-DAK`;
  }

  static async createReservation(userId: string, data: any) {
    const { roomId, checkInStr, checkOutStr, adults, children, promotionCode } = data;

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new BadRequestError("Les dates d'arrivée ou de départ sont invalides.");
    }

    if (checkOut <= checkIn) {
      throw new BadRequestError("La date de départ doit être supérieure à la date d'arrivée.");
    }

    // 1. Verify room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      throw new NotFoundError('La chambre demandée est introuvable.');
    }

    // 2. Check conflicts
    const isAvailable = await RoomService.checkAvailability(roomId, checkIn, checkOut);
    if (!isAvailable) {
      throw new ConflictError('La chambre est déjà réservée pour les dates sélectionnées.');
    }

    // 3. Calculate nights
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 4. Calculate price
    let basePrice = room.pricePerNight * numberOfNights;
    let discount = 0;
    let promotionId: string | null = null;

    if (promotionCode) {
      const promo = await prisma.promotion.findUnique({
        where: { code: promotionCode.toUpperCase() },
      });

      if (promo && promo.active && new Date() >= promo.startDate && new Date() <= promo.endDate && promo.currentUses < promo.maxUses) {
        promotionId = promo.id;
        if (promo.discountType === 'PERCENTAGE') {
          discount = basePrice * (promo.discountValue / 100);
        } else {
          discount = promo.discountValue;
        }
        discount = Math.min(discount, basePrice); // discount cannot exceed base price
      }
    }

    const totalPrice = basePrice - discount;

    // 5. Create unique reservation number
    let reservationNumber = '';
    let isUnique = false;
    while (!isUnique) {
      reservationNumber = this.generateReservationNumber();
      const existing = await prisma.reservation.findUnique({
        where: { reservationNumber },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // 6. Transaction: Create Reservation + increment promo usage
    const reservation = await prisma.$transaction(async (tx) => {
      if (promotionId) {
        await tx.promotion.update({
          where: { id: promotionId },
          data: { currentUses: { increment: 1 } },
        });
      }

      return tx.reservation.create({
        data: {
          reservationNumber,
          userId,
          roomId,
          checkIn,
          checkOut,
          adults,
          children,
          numberOfNights,
          totalPrice,
          status: 'PENDING',
          promotionId,
        },
        include: {
          room: {
            include: { roomType: true },
          },
          user: true,
          promotion: true,
        },
      });
    });

    // 7. Create notification
    await prisma.notification.create({
      data: {
        userId,
        message: `Votre réservation ${reservationNumber} a été enregistrée avec succès. Montant total : ${totalPrice.toLocaleString()} FCFA.`,
        type: 'SUCCESS',
      },
    });

    return reservation;
  }

  static async getAllReservations(filters: any = {}) {
    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }

    return prisma.reservation.findMany({
      where,
      include: {
        room: {
          include: { roomType: true },
        },
        user: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getReservationById(id: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        room: {
          include: { roomType: true, images: true },
        },
        user: true,
        payments: true,
        promotion: true,
      },
    });

    if (!reservation) {
      throw new NotFoundError('Réservation introuvable.');
    }

    return reservation;
  }

  static async updateReservationStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT') {
    const res = await this.getReservationById(id);

    const updatedRes = await prisma.$transaction(async (tx) => {
      const r = await tx.reservation.update({
        where: { id },
        data: { status },
      });

      // Business logic side effects:
      if (status === 'CHECKED_IN') {
        // Room status becomes occupied
        await tx.room.update({
          where: { id: res.roomId },
          data: { status: 'OCCUPIED' },
        });
      } else if (status === 'CHECKED_OUT') {
        // Room status becomes cleaning
        await tx.room.update({
          where: { id: res.roomId },
          data: { status: 'CLEANING' },
        });
      } else if (status === 'CANCELLED') {
        // Create notification for client
        await tx.notification.create({
          data: {
            userId: res.userId,
            message: `Votre réservation ${res.reservationNumber} a été annulée.`,
            type: 'WARNING',
          },
        });
      }

      return r;
    });

    return this.getReservationById(id);
  }

  static async deleteReservation(id: string) {
    await this.getReservationById(id);
    await prisma.reservation.delete({
      where: { id },
    });
    return { success: true, message: 'Réservation supprimée.' };
  }

  static async getClientReservations(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      include: {
        room: {
          include: { roomType: true, images: true },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async checkIn(id: string) {
    return this.updateReservationStatus(id, 'CHECKED_IN');
  }

  static async checkOut(id: string) {
    return this.updateReservationStatus(id, 'CHECKED_OUT');
  }
}
