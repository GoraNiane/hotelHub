import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../errors/customErrors';

export class PaymentController {
  static async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { reservationId, amount, paymentMethod } = req.body;

      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { user: true },
      });

      if (!reservation) {
        throw new NotFoundError('Réservation introuvable.');
      }

      // Generate a mock transaction reference
      const randomId = Math.floor(10000000 + Math.random() * 90000000);
      const transactionReference = `TX-${paymentMethod}-${randomId}`;

      const payment = await prisma.$transaction(async (tx) => {
        const p = await tx.payment.create({
          data: {
            reservationId,
            amount,
            paymentMethod,
            status: 'PAID',
            transactionReference,
            paidAt: new Date(),
          },
        });

        // Set Reservation status to CONFIRMED when paid
        await tx.reservation.update({
          where: { id: reservationId },
          data: { status: 'CONFIRMED' },
        });

        // Notify client
        await tx.notification.create({
          data: {
            userId: reservation.userId,
            message: `Paiement de ${amount.toLocaleString()} FCFA reçu avec succès via ${paymentMethod}. Réf : ${transactionReference}. Votre réservation est maintenant CONFIRMÉE.`,
            type: 'SUCCESS',
          },
        });

        return p;
      });

      res.status(201).json({
        success: true,
        message: 'Paiement simulé avec succès.',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          reservation: {
            include: {
              user: true,
              room: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }
}
