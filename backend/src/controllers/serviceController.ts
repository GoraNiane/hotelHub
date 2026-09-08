import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { NotFoundError } from '../errors/customErrors';

export class ServiceController {
  static async getAllServices(req: Request, res: Response, next: NextFunction) {
    try {
      // If admin, they can see inactive services. Otherwise, only show active ones.
      const showAll = req.query.all === 'true' && req.user?.role === 'ADMIN';
      const services = await prisma.service.findMany({
        where: showAll ? undefined : { active: true },
        orderBy: { name: 'asc' },
      });
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, icon, active } = req.body;
      const service = await prisma.service.create({
        data: { name, description, price, icon, active },
      });
      res.status(201).json({
        success: true,
        message: 'Service créé avec succès.',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, price, icon, active } = req.body;

      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Service introuvable.');
      }

      const service = await prisma.service.update({
        where: { id },
        data: { name, description, price, icon, active },
      });

      res.status(200).json({
        success: true,
        message: 'Service mis à jour avec succès.',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Service introuvable.');
      }

      await prisma.service.delete({ where: { id } });
      res.status(200).json({
        success: true,
        message: 'Service supprimé avec succès.',
      });
    } catch (error) {
      next(error);
    }
  }
}
