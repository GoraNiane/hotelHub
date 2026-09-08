import { Request, Response, NextFunction } from 'express';
import { ReservationService } from '../services/reservationService';
import { ForbiddenError } from '../errors/customErrors';
import prisma from '../config/db';
import * as bcrypt from 'bcryptjs';

export class ReservationController {
  static async createReservation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Non authentifié.' });
      }
      
      let targetUserId = req.user.id;
      
      // If booked by staff, resolve the target client
      if (req.user.role === 'ADMIN' || req.user.role === 'RECEPTIONIST') {
        if (req.body.userId) {
          targetUserId = req.body.userId;
        } else if (req.body.email) {
          // Find or auto-create client account
          let clientUser = await prisma.user.findUnique({
            where: { email: req.body.email.toLowerCase() },
          });
          
          if (!clientUser) {
            const salt = bcrypt.genSaltSync(10);
            // Default random password for auto-created clients
            const passwordHash = bcrypt.hashSync(`Client_${Math.floor(1000 + Math.random() * 9000)}`, salt);
            clientUser = await prisma.user.create({
              data: {
                firstName: req.body.firstName || 'Client',
                lastName: req.body.lastName || 'Teranga',
                email: req.body.email.toLowerCase(),
                password: passwordHash,
                phone: req.body.phone || null,
                role: 'CLIENT',
                enabled: true,
              },
            });
          }
          targetUserId = clientUser.id;
        }
      }

      const reservation = await ReservationService.createReservation(targetUserId, req.body);
      res.status(201).json({
        success: true,
        message: 'Réservation créée avec succès.',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.user?.role === 'CLIENT') {
        filters.userId = req.user.id;
      } else {
        if (req.query.userId) {
          filters.userId = req.query.userId;
        }
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }

      const reservations = await ReservationService.getAllReservations(filters);
      res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReservationById(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await ReservationService.getReservationById(req.params.id);

      // Security check: Client can only view their own reservation
      if (req.user?.role === 'CLIENT' && reservation.userId !== req.user.id) {
        throw new ForbiddenError("Vous n'avez pas la permission de consulter cette réservation.");
      }

      res.status(200).json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateReservationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const reservation = await ReservationService.updateReservationStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: 'Statut de la réservation mis à jour.',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReservationService.deleteReservation(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getClientReservations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Non authentifié.' });
      }
      const reservations = await ReservationService.getClientReservations(req.user.id);
      res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }
}
