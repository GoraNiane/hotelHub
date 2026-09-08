import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/customErrors';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const firstErrorMessage = err.errors[0]?.message || 'Données invalides';
    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  console.error('Unhandled Server Error:', err);
  return res.status(500).json({
    success: false,
    message: 'Une erreur interne du serveur est survenue.',
  });
};
