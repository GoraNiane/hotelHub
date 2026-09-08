import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { ReservationService } from '../services/reservationService';
import prisma from '../config/db';

export class ReceptionController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getReceptionDashboard();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTodayArrivals(req: Request, res: Response, next: NextFunction) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const arrivals = await prisma.reservation.findMany({
        where: {
          checkIn: {
            gte: today,
            lt: tomorrow,
          },
          status: { not: 'CANCELLED' },
        },
        include: {
          user: true,
          room: { include: { roomType: true } },
        },
      });

      res.status(200).json({
        success: true,
        data: arrivals,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTodayDepartures(req: Request, res: Response, next: NextFunction) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const departures = await prisma.reservation.findMany({
        where: {
          checkOut: {
            gte: today,
            lt: tomorrow,
          },
          status: { not: 'CANCELLED' },
        },
        include: {
          user: true,
          room: { include: { roomType: true } },
        },
      });

      res.status(200).json({
        success: true,
        data: departures,
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await ReservationService.checkIn(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Enregistrement (Check-in) effectué avec succès. La chambre est maintenant occupée.',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await ReservationService.checkOut(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Départ (Check-out) effectué avec succès. La chambre est en cours de nettoyage.',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }
}
