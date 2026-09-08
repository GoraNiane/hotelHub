import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../errors/customErrors';

export class PromotionController {
  static async validatePromoCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const promo = await prisma.promotion.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!promo) {
        throw new NotFoundError('Code promo introuvable.');
      }

      const now = new Date();
      if (!promo.active) {
        throw new BadRequestError('Ce code promo est inactif.');
      }

      if (now < promo.startDate) {
        throw new BadRequestError('Ce code promo n\'est pas encore valable.');
      }

      if (now > promo.endDate) {
        throw new BadRequestError('Ce code promo a expiré.');
      }

      if (promo.currentUses >= promo.maxUses) {
        throw new BadRequestError('La limite d\'utilisation de ce code promo a été atteinte.');
      }

      res.status(200).json({
        success: true,
        message: 'Code promo valide.',
        data: {
          id: promo.id,
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllPromotions(req: Request, res: Response, next: NextFunction) {
    try {
      const promos = await prisma.promotion.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({
        success: true,
        data: promos,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, discountType, discountValue, startDate, endDate, maxUses, active } = req.body;

      const existing = await prisma.promotion.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (existing) {
        throw new BadRequestError('Un code promo identique existe déjà.');
      }

      const promo = await prisma.promotion.create({
        data: {
          code: code.toUpperCase(),
          discountType,
          discountValue,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          maxUses,
          active,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Code promo créé avec succès.',
        data: promo,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { code, discountType, discountValue, startDate, endDate, maxUses, active } = req.body;

      const existing = await prisma.promotion.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Promotion introuvable.');
      }

      if (code && code.toUpperCase() !== existing.code) {
        const conflict = await prisma.promotion.findUnique({
          where: { code: code.toUpperCase() },
        });
        if (conflict) {
          throw new BadRequestError('Un code promo identique existe déjà.');
        }
      }

      const promo = await prisma.promotion.update({
        where: { id },
        data: {
          code: code ? code.toUpperCase() : undefined,
          discountType,
          discountValue,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          maxUses,
          active,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Code promo mis à jour avec succès.',
        data: promo,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const existing = await prisma.promotion.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Promotion introuvable.');
      }

      await prisma.promotion.delete({ where: { id } });
      res.status(200).json({
        success: true,
        message: 'Code promo supprimé avec succès.',
      });
    } catch (error) {
      next(error);
    }
  }
}
