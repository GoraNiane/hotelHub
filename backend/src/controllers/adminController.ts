import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import prisma from '../config/db';
import * as bcrypt from 'bcryptjs';
import { NotFoundError, BadRequestError } from '../errors/customErrors';

export class AdminController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getAdminDashboard();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          enabled: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await prisma.user.findMany({
        where: { role: 'CLIENT' },
        include: {
          reservations: {
            orderBy: { checkIn: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Map to return booking counts and last booking date
      const data = await Promise.all(
        customers.map(async (c) => {
          const resCount = await prisma.reservation.count({ where: { userId: c.id } });
          return {
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            phone: c.phone,
            role: c.role,
            enabled: c.enabled,
            createdAt: c.createdAt,
            reservationsCount: resCount,
            lastReservationDate: c.reservations[0]?.checkIn || null,
          };
        })
      );

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReceptionists(req: Request, res: Response, next: NextFunction) {
    try {
      const receptionists = await prisma.user.findMany({
        where: { role: 'RECEPTIONIST' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          enabled: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({
        success: true,
        data: receptionists,
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

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, phone, role } = req.body;

      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) {
        throw new BadRequestError('Cet email est déjà associé à un compte.');
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          password: passwordHash,
          phone: phone || null,
          role,
          enabled: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          enabled: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, role, enabled } = req.body;

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Utilisateur non trouvé.');
      }

      if (email && email.toLowerCase() !== existing.email) {
        const conflict = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (conflict) {
          throw new BadRequestError('Cet email est déjà associé à un autre compte.');
        }
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email: email?.toLowerCase(),
          phone,
          role,
          enabled,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          enabled: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Utilisateur mis à jour avec succès.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Utilisateur non trouvé.');
      }

      await prisma.user.delete({ where: { id } });
      res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès.',
      });
    } catch (error) {
      next(error);
    }
  }
}
