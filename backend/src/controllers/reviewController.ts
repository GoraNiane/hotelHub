import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../errors/customErrors';

export class ReviewController {
  static async getAllReviews(req: Request, res: Response, next: NextFunction) {
    try {
      // Clients/visitors only see approved reviews. Admins can see all.
      const showAll = req.query.all === 'true' && req.user?.role === 'ADMIN';
      const reviews = await prisma.review.findMany({
        where: showAll ? undefined : { approved: true },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Non authentifié.' });
      }
      const { roomName, rating, comment } = req.body;

      // Check if user has at least one Checked Out stay to be able to leave a review
      const hasStay = await prisma.reservation.findFirst({
        where: {
          userId: req.user.id,
          status: 'CHECKED_OUT',
        },
      });

      if (!hasStay) {
        throw new BadRequestError("Vous devez avoir effectué un séjour dans notre hôtel (Check-out fait) avant de pouvoir laisser un avis.");
      }

      const review = await prisma.review.create({
        data: {
          userId: req.user.id,
          roomName,
          rating,
          comment,
          approved: true, // auto-approve for the MVP, can be moderated later
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Avis enregistré avec succès ! Merci de votre partage.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      const existing = await prisma.review.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Avis introuvable.');
      }

      const review = await prisma.review.update({
        where: { id },
        data: { approved },
      });

      res.status(200).json({
        success: true,
        message: approved ? 'Avis publié.' : 'Avis masqué.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const existing = await prisma.review.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Avis introuvable.');
      }

      await prisma.review.delete({ where: { id } });
      res.status(200).json({
        success: true,
        message: 'Avis supprimé avec succès.',
      });
    } catch (error) {
      next(error);
    }
  }
}
